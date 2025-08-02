"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QPCCHeader } from "@/components/qpcc-header"
import { Separator } from "@/components/ui/separator"
import { ArrowRightLeft, Users, TrendingUp, Clock, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Team {
  id: string
  name: string
  player_count: number
  strength_score: number
}

interface Player {
  id: string
  name: string
  rank?: string
  rank_estimate?: string
  team_id: string
}

interface TradeItem {
  player_id: string
  from_team: boolean
}

interface Trade {
  id: string
  from_team_name: string
  to_team_name: string
  players_offered: string
  players_requested: string
  status: string
  created_at: string
  notes?: string
}

export default function EnhancedTradesPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [activeTrades, setActiveTrades] = useState<Trade[]>([])
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([])
  const [fromTeam, setFromTeam] = useState<string>("")
  const [toTeam, setToTeam] = useState<string>("")
  const [selectedOffered, setSelectedOffered] = useState<string[]>([])
  const [selectedRequested, setSelectedRequested] = useState<string[]>([])
  const [tradeNotes, setTradeNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [evaluating, setEvaluating] = useState(false)
  const [tradeImpact, setTradeImpact] = useState<any>(null)
  
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [teamsRes, playersRes, activeRes, historyRes] = await Promise.all([
      supabase.from("team_strength").select("*"),
      supabase.from("players").select("*").not("team_id", "is", null),
      supabase.from("active_trades_detailed").select("*"),
      supabase.from("trade_history_detailed").select("*")
    ])

    if (teamsRes.data) setTeams(teamsRes.data)
    if (playersRes.data) setPlayers(playersRes.data)
    if (activeRes.data) setActiveTrades(activeRes.data)
    if (historyRes.data) setTradeHistory(historyRes.data)
    
    setLoading(false)
  }

  const evaluateTrade = async () => {
    if (!fromTeam || !toTeam || (selectedOffered.length === 0 && selectedRequested.length === 0)) {
      toast.error("Please select teams and at least one player")
      return
    }

    setEvaluating(true)
    
    // Simulate trade evaluation
    const fromPlayers = players.filter(p => p.team_id === fromTeam)
    const toPlayers = players.filter(p => p.team_id === toTeam)
    
    const fromTeamData = teams.find(t => t.id === fromTeam)
    const toTeamData = teams.find(t => t.id === toTeam)
    
    // Calculate simulated impact
    const impact = {
      from_team: {
        name: fromTeamData?.name,
        current_strength: fromTeamData?.strength_score,
        players_out: selectedOffered.map(id => players.find(p => p.id === id)?.name).filter(Boolean),
        players_in: selectedRequested.map(id => players.find(p => p.id === id)?.name).filter(Boolean),
        // Simplified calculation - in real implementation would use the SQL function
        projected_strength: fromTeamData?.strength_score || 0 + (selectedRequested.length - selectedOffered.length) * 0.1
      },
      to_team: {
        name: toTeamData?.name,
        current_strength: toTeamData?.strength_score,
        players_out: selectedRequested.map(id => players.find(p => p.id === id)?.name).filter(Boolean),
        players_in: selectedOffered.map(id => players.find(p => p.id === id)?.name).filter(Boolean),
        projected_strength: toTeamData?.strength_score || 0 + (selectedOffered.length - selectedRequested.length) * 0.1
      }
    }
    
    setTradeImpact(impact)
    setEvaluating(false)
  }

  const proposeTrade = async () => {
    if (!fromTeam || !toTeam || (selectedOffered.length === 0 && selectedRequested.length === 0)) {
      toast.error("Please complete all trade details")
      return
    }

    // Create trade
    const { data: trade, error: tradeError } = await supabase
      .from("trades")
      .insert({
        from_team_id: fromTeam,
        to_team_id: toTeam,
        status: "pending",
        notes: tradeNotes,
        trade_type: "standard"
      })
      .select()
      .single()

    if (tradeError || !trade) {
      toast.error("Failed to create trade")
      return
    }

    // Add trade items
    const tradeItems = [
      ...selectedOffered.map(player_id => ({
        trade_id: trade.id,
        item_type: "player",
        from_team: true,
        player_id
      })),
      ...selectedRequested.map(player_id => ({
        trade_id: trade.id,
        item_type: "player",
        from_team: false,
        player_id
      }))
    ]

    const { error: itemsError } = await supabase
      .from("trade_items")
      .insert(tradeItems)

    if (itemsError) {
      toast.error("Failed to add trade details")
      return
    }

    toast.success("Trade proposed successfully")
    
    // Reset form
    setFromTeam("")
    setToTeam("")
    setSelectedOffered([])
    setSelectedRequested([])
    setTradeNotes("")
    setTradeImpact(null)
    
    fetchData()
  }

  const getRankBadge = (player: Player) => {
    const rank = player.rank_estimate || player.rank
    if (!rank) return <Badge variant="outline">U</Badge>
    
    const variants = {
      'A': 'destructive',
      'B': 'secondary',
      'C': 'default'
    } as const
    
    return <Badge variant={variants[rank as keyof typeof variants]}>{rank}</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading trade center...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <QPCCHeader />
              <Separator orientation="vertical" className="h-8" />
              <h1 className="text-xl font-bold">Trade Center</h1>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/admin">Back to Admin</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="propose" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="propose">Propose Trade</TabsTrigger>
            <TabsTrigger value="active">Active Trades ({activeTrades.length})</TabsTrigger>
            <TabsTrigger value="history">Trade History</TabsTrigger>
          </TabsList>

          <TabsContent value="propose" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>New Trade Proposal</CardTitle>
                <CardDescription>
                  Select teams and players to create a trade proposal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Team Selection */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Proposing Team</label>
                    <Select value={fromTeam} onValueChange={setFromTeam}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map(team => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name} ({team.player_count} players)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Trading With</label>
                    <Select 
                      value={toTeam} 
                      onValueChange={setToTeam}
                      disabled={!fromTeam}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.filter(t => t.id !== fromTeam).map(team => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name} ({team.player_count} players)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Player Selection */}
                {fromTeam && toTeam && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Players to Offer</label>
                      <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-3">
                        {players.filter(p => p.team_id === fromTeam).map(player => (
                          <div key={player.id} className="flex items-center space-x-2">
                            <Checkbox 
                              checked={selectedOffered.includes(player.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedOffered([...selectedOffered, player.id])
                                } else {
                                  setSelectedOffered(selectedOffered.filter(id => id !== player.id))
                                }
                              }}
                            />
                            <label className="flex-1 flex items-center justify-between cursor-pointer">
                              <span>{player.name}</span>
                              {getRankBadge(player)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Players to Request</label>
                      <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-3">
                        {players.filter(p => p.team_id === toTeam).map(player => (
                          <div key={player.id} className="flex items-center space-x-2">
                            <Checkbox 
                              checked={selectedRequested.includes(player.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedRequested([...selectedRequested, player.id])
                                } else {
                                  setSelectedRequested(selectedRequested.filter(id => id !== player.id))
                                }
                              }}
                            />
                            <label className="flex-1 flex items-center justify-between cursor-pointer">
                              <span>{player.name}</span>
                              {getRankBadge(player)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Trade Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Trade Notes (Optional)</label>
                  <Textarea
                    placeholder="Add any notes or conditions..."
                    value={tradeNotes}
                    onChange={(e) => setTradeNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Trade Summary */}
                {(selectedOffered.length > 0 || selectedRequested.length > 0) && (
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Trade Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <strong>{teams.find(t => t.id === fromTeam)?.name} sends:</strong>{" "}
                        {selectedOffered.length === 0 
                          ? "No players" 
                          : selectedOffered.map(id => players.find(p => p.id === id)?.name).join(", ")
                        }
                      </div>
                      <div>
                        <strong>{teams.find(t => t.id === toTeam)?.name} sends:</strong>{" "}
                        {selectedRequested.length === 0 
                          ? "No players" 
                          : selectedRequested.map(id => players.find(p => p.id === id)?.name).join(", ")
                        }
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Trade Impact Analysis */}
                {tradeImpact && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Trade Impact Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <h4 className="font-medium">{tradeImpact.from_team.name}</h4>
                          <div className="text-sm space-y-1">
                            <p>Current Strength: {tradeImpact.from_team.current_strength}</p>
                            <p>Projected Strength: {tradeImpact.from_team.projected_strength.toFixed(2)}</p>
                            <p className={tradeImpact.from_team.projected_strength < tradeImpact.from_team.current_strength ? "text-green-600" : "text-red-600"}>
                              Impact: {(tradeImpact.from_team.current_strength - tradeImpact.from_team.projected_strength).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">{tradeImpact.to_team.name}</h4>
                          <div className="text-sm space-y-1">
                            <p>Current Strength: {tradeImpact.to_team.current_strength}</p>
                            <p>Projected Strength: {tradeImpact.to_team.projected_strength.toFixed(2)}</p>
                            <p className={tradeImpact.to_team.projected_strength < tradeImpact.to_team.current_strength ? "text-green-600" : "text-red-600"}>
                              Impact: {(tradeImpact.to_team.current_strength - tradeImpact.to_team.projected_strength).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button 
                    onClick={evaluateTrade}
                    disabled={!fromTeam || !toTeam || (selectedOffered.length === 0 && selectedRequested.length === 0) || evaluating}
                    variant="outline"
                  >
                    {evaluating ? "Evaluating..." : "Evaluate Trade"}
                  </Button>
                  <Button 
                    onClick={proposeTrade}
                    disabled={!fromTeam || !toTeam || (selectedOffered.length === 0 && selectedRequested.length === 0)}
                  >
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Propose Trade
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeTrades.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No active trades at the moment
                </CardContent>
              </Card>
            ) : (
              activeTrades.map(trade => (
                <Card key={trade.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {trade.from_team_name} ↔ {trade.to_team_name}
                      </CardTitle>
                      <Badge variant="outline">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                    </div>
                    <CardDescription>
                      Proposed {new Date(trade.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium mb-1">{trade.from_team_name} offers:</p>
                        <p className="text-sm text-muted-foreground">{trade.players_offered}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">{trade.to_team_name} sends:</p>
                        <p className="text-sm text-muted-foreground">{trade.players_requested}</p>
                      </div>
                    </div>
                    {trade.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">{trade.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {tradeHistory.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No completed trades yet
                </CardContent>
              </Card>
            ) : (
              tradeHistory.map(trade => (
                <Card key={trade.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {trade.from_team_name} ↔ {trade.to_team_name}
                      </CardTitle>
                      <Badge 
                        variant={trade.status === 'completed' ? 'default' : 'secondary'}
                        className={trade.status === 'completed' ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        {trade.status === 'completed' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                        {trade.status === 'declined' && <XCircle className="mr-1 h-3 w-3" />}
                        {trade.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {new Date(trade.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      <strong>{trade.from_team_name}:</strong> {trade.players_offered}
                    </p>
                    <p className="text-sm">
                      <strong>{trade.to_team_name}:</strong> {trade.players_requested}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}