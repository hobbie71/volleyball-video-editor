import { FileInput } from "../components/FileInput";
import { ThemeToggle } from "../components/ThemeToggle";
import Page from "../components/ui/Page";
import { postVideoEvents } from "../api/videoApi";

const HomePage = () => {
  const handleFileUpload = async (file: File) => {
    const response = await postVideoEvents(file);
    console.log(response);
  };

  return (
    <Page className="flex flex-col justify-center items-center gap-8 p-8">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-text-primary">
          Volleyball Video Editor
        </h1>
        <ThemeToggle />
      </div>

      <div className="max-w-40 max-h-40">
        <FileInput accept="video/*" onUploadComplete={handleFileUpload} />
      </div>
    </Page>
  );
};

export default HomePage;
