import Navbar from "/components/Navbar.jsx";
import { fetchCalendar, fetchDoors } from "/utils/fetchCalendarData";
import DoorCard from "/components/edit/doorCard"

export default async function EditPage({ params }) {
    const calendar = await fetchCalendar(params.path);
    const doors = await fetchDoors(params.path);

    if (!doors || !calendar) {
        return;
    }

    return (
        <div>
            <Navbar />
            <div className="container mx-auto p-6 pt-16">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Edit Calendars</h1>
                </div>
                <div className="mb-4 font-semibold">
                    <h2 className="text-lg">{calendar.title}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {doors.map(door => (
                        <DoorCard door={door} key={door._id} />
                    ))}
                </div>
            </div>
        </div>
    );
}
