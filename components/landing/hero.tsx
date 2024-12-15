import Image from "next/image";

const Hero = () => {
  return (
    <div className="flex flex-col gap-24">
      <div className="flex gap-8">
        <div>
          <div className="flex gap-2 items-center mb-8">
            <div className="size-4 bg-blue-700" />
            track, budget, and save effortlessly
          </div>
          <h1 className="mb-8 text-6xl font-bold">
            Simplify Your Money, Secure Your Future
          </h1>
          <p className="text-lg opacity-80">
            <span className="font-bold">Finance Pro</span> helps you track
            spending, manage budgets, and save smarter—all in one simple app.
            Take control of your finances and reach your goals with ease.
          </p>
        </div>
        <Image src="/hero-1.svg" alt="hero-1" width={400} height={400} />
      </div>
      <div className="flex gap-8">
        <Image src="/hero-2.svg" alt="hero-2" width={400} height={400} />
        <div>
          <div className="flex gap-2 items-center mb-8">
            <div className="size-4 bg-blue-700" />
            insights that simplify your financial journey.
          </div>
          <h1 className="mb-8 text-6xl font-bold">
            Visualize Your Financial Health
          </h1>
          <p className="text-lg opacity-80">
            Get a clear view of your finances with intuitive charts and reports.
            This app breaks down your spending and savings into visual insights,
            helping you identify trends, control habits, and plan smarter for
            the future.
          </p>
        </div>
      </div>
      <div className="flex gap-8">
        <div>
          <div className="flex gap-2 items-center mb-8">
            <div className="size-4 bg-blue-700" />
            track spending and stay on target
          </div>
          <h1 className="mb-8 text-6xl font-bold">
            Build Budgets That Work for You
          </h1>
          <p className="text-lg opacity-80">
            Easily create and manage budgets tailored to your lifestyle. This
            app helps you monitor expenses, set spending limits, and get alerts
            when you’re close to overspending. Stay on track and make every
            dollar count.
          </p>
        </div>
        <Image src="/hero-3.svg" alt="hero-3" width={400} height={400} />
      </div>
    </div>
  );
};

export default Hero;
