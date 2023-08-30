import Image from "next/image";
import DoorsComponent from "/components/doors/doorsComponent"

const fetchCalendar = async (path) => {
  try {
    const response = await fetch(`http://localhost:3000/api/calendars/getOne/${path}`, { next: { revalidate: 10 } });
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch calendar:", error.message);
  }
};

const fetchDoors = async (path) => {
  try {
    const response = await fetch(`http://localhost:3000/api/doors/getAll/${path}`, { next: { revalidate: 10 } });
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const { data } = await response.json();
    // return data;
    // Sort the doors by the date property
    const sortedDoors = data.sort((a, b) => new Date(a.date) - new Date(b.date));
    return sortedDoors;
  } catch (error) {
    console.error("Failed to fetch doors:", error.message);
  }
}

export default async function ViewPage({ params }) {
  const calendar = await fetchCalendar(params.path);
  const doors = await fetchDoors(params.path);

  const { logoImage, title, titleTextColor, backgroundImage, backgroundColor } =
    calendar;

  return (
    <main
      className="p-4 h-full min-h-screen"
      style={{
        backgroundImage: backgroundImage.fileUrl ? `url(${backgroundImage.fileUrl})` : "none",
        backgroundColor: backgroundImage.fileUrl ? "transparent" : backgroundColor,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >

      <header className="mt-4">
        {logoImage.fileUrl && (
          <div className="flex justify-center items-center">
            <Image
              src={logoImage.fileUrl}
              alt="Logo Image"
              width={400}
              height={400}
              priority={true}
            />
          </div>
        )}
        <h1 className="text-center mt-4 text-3xl font-medium" style={{ color: titleTextColor }}>{title}</h1>
      </header>

      <section className="my-8 flex flex-wrap flex-none gap-4 justify-center">
          <DoorsComponent doors={doors}/>
      </section>

  {/* <section>
    {doors.map((door) => (
      <Door key={door._id} door={door} />
    ))}
  </section> */}
      
    </main>
  );
}