import { Button } from "@/components/ui/button";
import { Flame, Sunrise, Sparkles, Cake, Plane } from "lucide-react";

export const Offers = () => {
  const offers = [
    {
      icon: Flame,
      title: "Đặt sớm",
      description: "Giảm ngay 20% cho kỳ nghỉ đầu tiên",
      highlight: true,
    },
    {
      icon: Sunrise,
      title: "Ưu đãi mùa du lịch",
      description: "Giảm đến 30% cho villa view biển Mỹ Khê",
      highlight: true,
    },
    {
      icon: Sparkles,
      title: "Ưu đãi 'Chạm bình yên'",
      description: "Giảm 15% cho kỳ nghỉ từ 2 đêm",
      highlight: false,
    },
    {
      icon: Cake,
      title: "Miễn phí setup BBQ",
      description: "Trang trí sinh nhật miễn phí",
      highlight: false,
    },
    {
      icon: Plane,
      title: "Hỗ trợ đón sân bay",
      description: "Check-in sớm miễn phí",
      highlight: false,
    },
  ];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-sand opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ưu đãi đặc biệt – Chỉ trong hôm nay!
          </h2>
        </div>

        {/* Offers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {offers.map((offer, index) => (
            <div
              key={index}
              className={`p-8 rounded-2xl shadow-soft hover:shadow-elegant transition-all duration-300 animate-fade-in ${
                offer.highlight
                  ? "bg-gradient-hero text-primary-foreground border-2 border-secondary"
                  : "bg-card"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                  offer.highlight ? "bg-secondary" : "bg-primary"
                }`}
              >
                <offer.icon
                  className={`w-7 h-7 ${
                    offer.highlight ? "text-secondary-foreground" : "text-primary-foreground"
                  }`}
                />
              </div>
              <h3
                className={`font-playfair text-2xl font-bold mb-3 ${
                  offer.highlight ? "text-primary-foreground" : "text-foreground"
                }`}
              >
                {offer.title}
              </h3>
              <p
                className={`font-poppins ${
                  offer.highlight ? "text-primary-foreground/90" : "text-muted-foreground"
                }`}
              >
                {offer.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center animate-fade-in">
          <Button variant="cta" size="lg" className="font-poppins text-lg px-10 py-6">
            Đặt ngay để nhận ưu đãi
          </Button>
        </div>
      </div>
    </section>
  );
};