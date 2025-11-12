import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Download } from "lucide-react";
import { addToGoogleCalendar, downloadICSFile } from "@/lib/calendar";
import { toast } from "sonner";

export function CalendarReminder() {
  const [reminderTime, setReminderTime] = useState("18:00");

  const handleAddToCalendar = (type: 'google' | 'download') => {
    const [hours, minutes] = reminderTime.split(':').map(Number);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(hours, minutes, 0, 0);

    const endTime = new Date(tomorrow);
    endTime.setMinutes(endTime.getMinutes() + 30);

    const event = {
      title: "Momentum Workout Reminder",
      description: "Time for your daily fitness routine! Keep your streak alive 💪",
      start: tomorrow,
      end: endTime,
    };

    if (type === 'google') {
      addToGoogleCalendar(event);
      toast.success("Opening Google Calendar...");
    } else {
      downloadICSFile(event);
      toast.success("Calendar file downloaded! Add it to your calendar app.");
    }
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-display font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Workout Reminders
        </CardTitle>
        <CardDescription>
          Add reminders to your calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="reminder-time">Preferred Time</Label>
          <Input
            id="reminder-time"
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={() => handleAddToCalendar('google')}
            className="w-full"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Add to Google Calendar
          </Button>
          
          <Button
            onClick={() => handleAddToCalendar('download')}
            variant="outline"
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Download .ics File
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Set daily reminders to stay consistent with your goals
        </p>
      </CardContent>
    </Card>
  );
}
