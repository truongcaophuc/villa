import { Check, X } from "lucide-react";

export const USP = () => {
  const comparisons = [
    {
      feature: "Không gian riêng tư",
      hotel: false,
      villa: true,
    },
    {
      feature: "Hồ bơi riêng",
      hotel: false,
      villa: true,
    },
    {
      feature: "Bếp nấu đầy đủ",
      hotel: false,
      villa: true,
    },
    {
      feature: "Khu vực BBQ",
      hotel: false,
      villa: true,
    },
    {
      feature: "View biển trực diện",
      hotel: false,
      villa: true,
    },
    {
      feature: "Phục vụ tận tâm 24/7",
      hotel: true,
      villa: true,
    },
    {
      feature: "Giá tương đương",
      hotel: true,
      villa: true,
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-6">
            Villa Đà Nẵng – Nghỉ dưỡng riêng tư,
            <br />
            đẳng cấp chuẩn resort 5 sao
          </h2>
          <p className="font-poppins text-lg text-muted-foreground max-w-3xl mx-auto">
            So sánh với khách sạn truyền thống (ồn ào, thiếu riêng tư). Villa của bạn kết hợp không gian
            riêng tư với dịch vụ chuẩn resort: hồ bơi riêng, đầu bếp riêng, BBQ, view biển, nhân viên phục vụ chu đáo.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto bg-card rounded-2xl shadow-elegant overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 p-6 bg-primary text-primary-foreground">
            <div className="font-playfair text-xl font-semibold">Tiêu chí</div>
            <div className="font-playfair text-xl font-semibold text-center">Khách sạn 4 sao</div>
            <div className="font-playfair text-xl font-semibold text-center">Villa Đà Nẵng</div>
          </div>

          {/* Comparison Rows */}
          {comparisons.map((item, index) => (
            <div
              key={index}
              className={`grid grid-cols-3 gap-4 p-6 items-center ${
                index % 2 === 0 ? "bg-muted/20" : "bg-card"
              } hover:bg-accent/10 transition-colors`}
            >
              <div className="font-poppins text-foreground">{item.feature}</div>
              <div className="flex justify-center">
                {item.hotel ? (
                  <Check className="w-6 h-6 text-accent" />
                ) : (
                  <X className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex justify-center">
                {item.villa ? (
                  <Check className="w-6 h-6 text-primary" />
                ) : (
                  <X className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};