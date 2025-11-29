import { Frown, MapPinOff, Users, DollarSign } from "lucide-react";

export const Problem = () => {
  const problems = [
    {
      icon: MapPinOff,
      text: "Phòng nhỏ, xa trung tâm, ồn ào",
    },
    {
      icon: Users,
      text: "Không gian chật chội, phải thuê 2–3 phòng cho cả gia đình",
    },
    {
      icon: Frown,
      text: "Không có khu BBQ hoặc chỗ chơi cho trẻ",
    },
    {
      icon: DollarSign,
      text: "Giá khách sạn cao nhưng dịch vụ không tương xứng",
    },
  ];

  return (
    <section className="py-20 bg-gradient-ocean">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-6">
            Bạn từng mất cả ngày để tìm một villa view biển thật đẹp
            <br />
            nhưng lại quá xa trung tâm?
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-6 bg-card rounded-xl shadow-soft hover:shadow-elegant transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex-shrink-0 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <problem.icon className="w-6 h-6 text-destructive" />
              </div>
              <p className="font-poppins text-lg text-muted-foreground flex-1">
                {problem.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};