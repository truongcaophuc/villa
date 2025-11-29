import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ = () => {
  const faqs = [
    {
      question: "Villa có cách xa trung tâm và bãi biển không?",
      answer:
        "Không xa, chỉ 3–5 phút tới biển Mỹ Khê, 10 phút vào trung tâm. Vị trí của villa rất thuận tiện để bạn có thể tận hưởng cả biển và các tiện ích thành phố.",
    },
    {
      question: "Có hồ bơi riêng và khu BBQ không?",
      answer:
        "Có đầy đủ hồ bơi riêng, khu vực BBQ, và bếp nấu hiện đại. Tất cả đều được thiết kế để mang đến trải nghiệm nghỉ dưỡng tốt nhất cho bạn và gia đình.",
    },
    {
      question: "Có dọn phòng hoặc nấu ăn riêng không?",
      answer:
        "Có nhân viên dọn phòng hàng ngày và dịch vụ đầu bếp riêng theo yêu cầu. Chúng tôi đảm bảo mọi nhu cầu của bạn đều được đáp ứng chu đáo.",
    },
    {
      question: "Chính sách hủy phòng thế nào?",
      answer:
        "Hủy trước 7 ngày: hoàn 100%. Hủy từ 3-7 ngày: hoàn 50%. Hủy dưới 3 ngày: không hoàn tiền. Chính sách linh hoạt để bạn yên tâm đặt phòng.",
    },
    {
      question: "Có hỗ trợ đón sân bay không?",
      answer:
        "Có, miễn phí cho khách đặt từ 2 đêm trở lên. Chúng tôi cũng hỗ trợ check-in sớm và check-out muộn tùy tình trạng phòng.",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-6">
            Câu hỏi thường gặp
          </h2>
        </div>

        <div className="max-w-3xl mx-auto animate-fade-in">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-xl shadow-soft px-6 border-none"
              >
                <AccordionTrigger className="font-playfair text-lg text-foreground hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="font-poppins text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};