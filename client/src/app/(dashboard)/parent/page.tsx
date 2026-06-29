import { auth } from "@/auth";
import Link from "next/link";

export default async function ParentDashboardPage() {
  const session = await auth();
  const userName = session?.user?.name || "Parent";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your children&apos;s learning journey
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="My Students"
          description="Manage student profiles and track their learning progress"
          icon="👨‍👩‍👧‍👦"
          href="/parent/students"
          buttonText="View Students"
          color="blue"
        />
        
        <DashboardCard
          title="Find Tutors"
          description="Search and discover qualified tutors for your students"
          icon="🔍"
          href="/parent/search"
          buttonText="Browse Tutors"
          color="green"
        />
        
        <DashboardCard
          title="Tutoring Requests"
          description="Track and manage your tutoring request status"
          icon="📋"
          href="/parent/requests"
          buttonText="View Requests"
          color="purple"
        />
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          How to Get Started
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StepCard
            number={1}
            title="Create Student Profile"
            description="Add your child's information and learning needs"
          />
          <StepCard
            number={2}
            title="Search for Tutors"
            description="Browse tutors matched to your student"
          />
          <StepCard
            number={3}
            title="Send Request"
            description="Request a session with your preferred tutor"
          />
          <StepCard
            number={4}
            title="Track Progress"
            description="Monitor requests and manage bookings"
          />
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  icon,
  href,
  buttonText,
  color,
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
  buttonText: string;
  color: "blue" | "green" | "purple";
}) {
  const colorClasses = {
    blue: "border-blue-200 hover:border-blue-400 hover:shadow-blue-100",
    green: "border-green-200 hover:border-green-400 hover:shadow-green-100",
    purple: "border-purple-200 hover:border-purple-400 hover:shadow-purple-100",
  };

  const buttonColors = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    purple: "bg-purple-600 hover:bg-purple-700",
  };

  return (
    <div
      className={`bg-white rounded-lg border-2 ${colorClasses[color]} p-6 transition-all hover:shadow-lg`}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 text-sm">{description}</p>
      <Link
        href={href}
        className={`inline-block w-full text-center px-4 py-2 ${buttonColors[color]} text-white rounded-lg transition-colors font-medium`}
      >
        {buttonText}
      </Link>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mb-3">
        {number}
      </div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
