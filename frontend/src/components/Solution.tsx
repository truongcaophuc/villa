import { Button } from "@/components/ui/button";
import { Home, Waves, Sparkles, Users, Heart } from "lucide-react";
import villaAmenities from "@/assets/villa-amenities.jpg";
import Image from 'next/image';
export const Solution = () => {
  const benefits = [
    {
      icon: Home,
      title: "Không gian riêng tư",
      description: "Nghỉ dưỡng thật sự",
    },
    {
      icon: Waves,
      title: "Vị trí sát biển",
      description: "Bước vài bước là chạm sóng",
    },
    {
      icon: Sparkles,
      title: "Tiện nghi cao cấp",
      description: "Hồ bơi riêng, bếp nấu, BBQ",
    },
    {
      icon: Users,
      title: "Phù hợp mọi nhóm khách",
      description: "Gia đình, cặp đôi, nhóm bạn",
    },
    {
      icon: Heart,
      title: "Dịch vụ tận tâm",
      description: "Chu đáo từ check-in đến checkout",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-6">
            Villa Đà Nẵng – Nơi kỳ nghỉ của bạn thật sự bắt đầu
          </h2>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 bg-gradient-sand rounded-xl hover:shadow-elegant transition-all duration-300 animate-fade-in group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-soft">
                <benefit.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-playfair text-xl font-semibold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="font-poppins text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Feature Image */}
        <div className="max-w-5xl mx-auto mb-8 animate-scale-in">
          <Image
            src={villaAmenities}
            alt="Luxury villa pool and BBQ amenities with ocean view"
            className="w-full h-auto rounded-2xl shadow-elegant"
          />
        </div>

        {/* CTA */}
        <div className="text-center animate-fade-in">
          <Button variant="primary" size="lg" className="font-poppins">
            Khám phá ngay
          </Button>
        </div>
      </div>
    </section>
  );
};