import { Users, Star, Award, Waves } from "lucide-react";

export const SocialProof = () => {
  const stats = [
    {
      icon: Waves,
      number: "1.200+",
      label: "Lượt khách lưu trú mỗi năm",
    },
    {
      icon: Star,
      number: "98%",
      label: "Khách hài lòng và quay lại",
    },
    {
      icon: Award,
      number: "350+",
      label: "Đánh giá 5 sao trên Google & Booking",
    },
    {
      icon: Users,
      number: "Top 10",
      label: "Villa được yêu thích nhất khu vực Mỹ Khê",
    },
  ];

  return (
    <section className="py-20 bg-gradient-hero text-primary-foreground relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6">
            Hàng ngàn khách đã chọn Villa Đà Nẵng
            <br />
            cho kỳ nghỉ của họ
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-8 bg-primary-foreground/10 backdrop-blur-sm rounded-xl hover:bg-primary-foreground/20 transition-all duration-300 animate-fade-in group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                <stat.icon className="w-8 h-8 text-secondary-foreground" />
              </div>
              <div className="font-playfair text-4xl md:text-5xl font-bold mb-2">
                {stat.number}
              </div>
              <p className="font-poppins text-base opacity-90">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};