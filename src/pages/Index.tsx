import SubwayPicker from "@/components/SubwayPicker.tsx";
import StationPicker from "@/components/StationPicker";
import TodoPicker from "@/components/TodoPicker";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="text-center pt-10 pb-6 px-4">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Step<span className="text-primary">Picker</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          어디로 갈지, 뭘 할지 고민될 때 — 랜덤으로 결정!
        </p>
      </header>

      {/* Cards */}
      <main className="max-w-lg mx-auto px-4 pb-12 space-y-6">
        <SubwayPicker />
        <StationPicker />
        <TodoPicker />
      </main>
    </div>
  );
};

export default Index;
