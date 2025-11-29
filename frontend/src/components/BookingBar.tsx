import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function formatVi(date: Date | undefined) {
  if (!date) return "";
  try {
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return date.toLocaleDateString();
  }
}

export default function BookingBar() {
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [openCheckIn, setOpenCheckIn] = useState(false);
  const [openCheckOut, setOpenCheckOut] = useState(false);
  const [guests, setGuests] = useState<number>(2);
  const [openGuests, setOpenGuests] = useState(false);

  const handleBook = () => {
    console.log("Đặt phòng:", {
      checkIn: checkIn ? checkIn.toISOString() : null,
      checkOut: checkOut ? checkOut.toISOString() : null,
      guests,
    });
    // TODO: tích hợp API đặt phòng hoặc điều hướng trang đặt phòng
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 backdrop-blur bg-white/70 border-t shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center gap-3">
        <Popover open={openCheckIn} onOpenChange={setOpenCheckIn}>
          <PopoverTrigger asChild>
            <div className="w-full md:w-auto md:flex-1">
              <Input
                readOnly
                value={checkIn ? formatVi(checkIn) : "Ngày nhận phòng"}
                onClick={() => setOpenCheckIn(true)}
                aria-label="Ngày nhận phòng"
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={checkIn}
              onSelect={(d) => {
                setCheckIn(d);
                setOpenCheckIn(false);
              }}
            />
          </PopoverContent>
        </Popover>

        <Popover open={openCheckOut} onOpenChange={setOpenCheckOut}>
          <PopoverTrigger asChild>
            <div className="w-full md:w-auto md:flex-1">
              <Input
                readOnly
                value={checkOut ? formatVi(checkOut) : "Ngày trả phòng"}
                onClick={() => setOpenCheckOut(true)}
                aria-label="Ngày trả phòng"
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={checkOut}
              onSelect={(d) => {
                setCheckOut(d);
                setOpenCheckOut(false);
              }}
            />
          </PopoverContent>
        </Popover>

        <Popover open={openGuests} onOpenChange={setOpenGuests}>
          <PopoverTrigger asChild>
            <div className="w-full md:w-auto md:flex-1">
              <Input
                readOnly
                value={`Số khách: ${guests}`}
                onClick={() => setOpenGuests(true)}
                aria-label="Số lượng khách"
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="center">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm">Chọn số khách</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Giảm số khách"
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                >
                  −
                </Button>
                <span className="min-w-8 text-center text-base">{guests}</span>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Tăng số khách"
                  onClick={() => setGuests((g) => Math.min(20, g + 1))}
                >
                  +
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button className="w-full md:w-auto" variant="primary" size="lg" onClick={handleBook}>
          Đặt phòng
        </Button>
      </div>
    </div>
  );
}