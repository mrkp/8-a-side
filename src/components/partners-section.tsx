import { Card } from "@/components/ui/card"

const partners = [
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2F39487080-2a8e-4afa-bc25-5498aa2ace22.jpg?alt=media&token=bfe1f996-881d-4b81-9b1a-0b16d3908db0",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2Fddffd93e-70b9-4194-a9ec-c36858ab2c32.jpg?alt=media&token=4dd159cd-2718-4ff7-b887-6b518da75af5",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2Fa4732108-643d-4ba6-a8bf-0f2456985d1e.jpg?alt=media&token=8cd22546-cd07-4bf4-9932-31fadc659daf",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2F2f7c3725-c3b3-4a48-aeed-c2576bdeff4c.png?alt=media&token=a462ad25-6a28-492f-aba2-b55a89924865",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2F7feb1dd3-671a-46fa-a442-958a39308b41.png?alt=media&token=1f0514f0-ae6e-4d8d-8369-8d1a8e95a3f1",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2F58744033-f620-47c5-99f6-da79896ac2c2.png?alt=media&token=f7af4143-5b78-4b8e-84a7-539643845a17",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2Fe31b28fa-7e2e-4ffd-b398-22a47870c301.jpg?alt=media&token=dd51fd7d-04c2-40a3-b5ff-f3dc332f390f",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2F92147a90-23f5-47fe-8f60-f111545d88c8.png?alt=media&token=cde8b7eb-9f4a-4ed9-9ed2-12d7d9f735ea",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2F6079e238-51d5-47f7-8e29-3112c136f40a.jpg?alt=media&token=6e3d9154-be45-4105-9e02-4b71ba29983d",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2F795f790f-9251-4d26-aabf-05eb2cd6f5fe.jpg?alt=media&token=a31be029-3211-47cf-a214-c715b136efee",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2Fd7dd7289-26a1-4486-81f4-c8b8cedb0ba1.png?alt=media&token=f5315e5d-7ee0-4540-9a5c-883d2eb29350",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2Fc5fd57f4-183e-4151-bc23-e5edc4c572de.png?alt=media&token=5b007630-443a-4b89-8d4d-f50e2343f736",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2Fa396d5e6-ca10-47b6-908f-2fcb83bd0e5b.jpg?alt=media&token=73cec32e-0871-49b5-ba5c-0e5d01b31cac",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2F383e9a85-c32e-4d20-b2ec-8bf34d68594a.jpg?alt=media&token=a18ab2bf-4553-401c-a39e-4fb36f5119fd",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2F618f454a-1b21-455f-873b-e07b6566bb7e.png?alt=media&token=a6f8e7ac-0e19-4597-8b9a-a81b21927edd",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2Fd261e599-f968-4673-928c-00e03b70e48a.jpg?alt=media&token=ebbdfea0-a647-4d86-aa1a-ac7eb6724dbd",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2F519df654-dbdd-4161-8c0c-80223339a672.jpg?alt=media&token=db7c8421-9c44-47f3-abd6-ec5751a09b47",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2F8ecfc3de-c046-42b7-8e0e-cc26541abb13.jpg?alt=media&token=c7b19148-d577-4cf1-a484-c9bd97f9ff91",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2F6bfdb200-1e9c-4e95-a9c4-d0c2d3774620.png?alt=media&token=061f300e-418a-4286-9df4-2ec903813eac",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2Fb1499fea-9a54-4334-bddc-e142a9e1471f.jpg?alt=media&token=76bf4194-babf-40d1-9486-7dcb44ff245d",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2F3d46ccdb-20ff-454a-9836-35736dc5fa4a.png?alt=media&token=5daf6628-505a-4aea-89ab-a9a71f9ae329",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2Fccba8d9d-023b-4e15-b602-85dfc8f0017b.png?alt=media&token=4fc898f0-7e33-447f-ae31-5f87a09c39e2",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2F3caf1d30-103a-4403-a4e6-a13c89c24d26.jpg?alt=media&token=8c737f32-d6b9-457b-b691-d824ab752654",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2F1f087bd4-e544-44e1-89be-8fc3785e1e27.png?alt=media&token=b525c31e-0c58-4faf-952f-922173456dcd",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2F63503c17-cdc7-4ec1-bf99-0859590b7da0.png?alt=media&token=5c5ea752-bf1c-46c0-abae-525082bcea5f",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2Fcad4327b-f268-4e85-8981-7d3a0a3bda64.png?alt=media&token=596518fa-0bfe-40a0-8c96-309d18abefa4",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2Fd666fd68-7b31-4464-b21b-19137b854572.png?alt=media&token=8b8c1bb7-1ebd-4b67-a104-0df4aa6c5735",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2F9829f77a-0ab3-4b6e-8d52-afc90340ec2a.png?alt=media&token=8b1dc9b2-2c6e-45d4-8dcf-af066cd85668",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2F09ad3743-7b3e-46d0-916f-b02d1ee9822e.png?alt=media&token=f4c3ddc2-502a-40da-b682-fcad702750ed",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2F29d9b465-9a12-4c0e-9073-595ad4b6bdbc.png?alt=media&token=70273b80-66f6-488c-8e8f-678140972a34",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2Fa545b1e8-42aa-40c3-a2d7-f3bd27c70704.png?alt=media&token=499473ae-1114-4244-a09b-3946fdae0144",
  "https://firebasestorage.googleapis.com/v0/b/tournament-uploads/o/sponsors%2Fm5BaLi3o2eeF5d5vrTK1McRGJrI3%2FTO796F9NPvJpxT6yrCRL%2F19fbf6f8-5e73-4db4-b231-04db1419e178.jpg?alt=media&token=b59da0e2-a941-481b-bafb-396b44a50b18"
]

export function PartnersSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Partners</h2>
            <p className="text-muted-foreground">
              Proudly supported by these amazing organizations
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {partners.map((partner, index) => (
              <Card key={index} className="overflow-hidden bg-background hover:shadow-lg transition-shadow">
                <div className="aspect-square p-4 flex items-center justify-center">
                  <img 
                    src={partner} 
                    alt={`Partner ${index + 1}`}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}