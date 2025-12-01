"use client";

import { useState } from "react";
import { CheckSquare, BookOpen, User, BookPlus, Search} from "lucide-react";

type TabType = "dashboard" | "checkin" | "catalog" | "finduser" | "checkout";

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const navItems = [
    { id: "checkin" as TabType, label: "Check In", icon: CheckSquare },
    { id: "catalog" as TabType, label: "Catalog", icon: BookOpen },
    { id: "finduser" as TabType, label: "Find User", icon: User },
    { id: "checkout" as TabType, label: "Check Out", icon: BookPlus },
  ];

  return (
    <div className="h-16 border-b flex items-center justify-center px-6 gap-4" style={{ borderColor: "#EBEBEB" }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const isCheckOut = item.id === "checkout";

        if (isCheckOut) {
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="px-4 py-2 rounded text-white flex items-center gap-2"
              style={{ backgroundColor: isActive ? "#B60000" : "#B60000" }}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className="px-4 py-2 rounded flex items-center gap-2 transition-colors"
            style={{
              color: isActive ? "#B60000" : "#000000",
            }}
          >
            <Icon size={18} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function DashboardContent() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4" style={{ color: "#000000" }}>
        Dashboard
      </h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Quick search for a book"
          className="w-full max-w-md px-4 py-2 border rounded-lg"
          style={{ borderColor: "#EBEBEB", color: "#B3B3B3" }}
        />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border" style={{ borderColor: "#EBEBEB" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: "#B60000" }}>
              Number of Users
            </span>
            <span style={{ color: "#B60000" }}>ℹ</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "#000000" }}>
            17
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border" style={{ borderColor: "#EBEBEB" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: "#B60000" }}>
              Circulation
            </span>
            <span style={{ color: "#B60000" }}>ℹ</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "#000000" }}>
            17
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border" style={{ borderColor: "#EBEBEB" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: "#B60000" }}>
              Items Checked Out
            </span>
            <span style={{ color: "#B60000" }}>ℹ</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "#000000" }}>
            17
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border" style={{ borderColor: "#EBEBEB" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: "#B60000" }}>
              Total Fines
            </span>
            <span style={{ color: "#B60000" }}>ℹ</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: "#000000" }}>
            $17.00
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: "#000000" }}>
            Books
          </h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-lg border flex items-center justify-between"
                style={{ borderColor: "#EBEBEB" }}
              >
                <div>
                  <p className="font-semibold" style={{ color: "#000000" }}>
                    Houses of Wiliamsurg, Virginia
                  </p>
                  <p className="text-sm" style={{ color: "#929292" }}>
                    0923398364
                  </p>
                  <p className="text-sm" style={{ color: "#929292" }}>
                    John Smith
                  </p>
                </div>
                <button
                  className={`px-4 py-1 rounded text-white ${
                    i === 3 ? "bg-red-400" : "bg-green-400"
                  }`}
                >
                  {i === 3 ? "Out" : "In"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: "#000000" }}>
            Recent Users
          </h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-lg border flex items-center justify-between"
                style={{ borderColor: "#EBEBEB" }}
              >
                <div>
                  <p className="font-semibold" style={{ color: "#000000" }}>
                    FirstName Last Name
                  </p>
                  <p className="text-sm" style={{ color: "#929292" }}>
                    399999999999999
                  </p>
                  <p className="text-sm" style={{ color: "#929292" }}>
                    1600 Jade Street, Frisco Texas 75033
                  </p>
                </div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ color: "#000000" }}
                >
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckInContent() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4" style={{ color: "#000000" }}>
        Check In
      </h1>

      <div className="mb-6">
        <div className="bg-[#F6F6F6] p-[1rem] space-x-[1.25rem] w-full border border-[#EBEBEB] rounded-lg flex flex-row">
          <Search />
          <input
            type="text"
            placeholder="Please enter ISBN"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

function CatalogContent() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4" style={{ color: "#000000" }}>
        Catalog
      </h1>
      <div className="mb-6">
        <div className="bg-[#F6F6F6] p-[1rem] space-x-[1.25rem] w-full border border-[#EBEBEB] rounded-lg flex flex-row">
          <Search />
          <input
            type="text"
            placeholder="Please enter book name"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

function FindUserContent() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4" style={{ color: "#000000" }}>
        Find User
      </h1>
      <p style={{ color: "#929292" }}>Find User content will go here</p>
    </div>
  );
}

function CheckOutContent() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4" style={{ color: "#000000" }}>
        Check Out
      </h1>
      <p style={{ color: "#929292" }}>Check Out content will go here</p>
    </div>
  );
}

export function MainCard() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  const getTitle = () => {
    switch (activeTab) {
      case "checkin":
        return "Check In";
      case "catalog":
        return "Catalog";
      case "finduser":
        return "Find User";
      case "checkout":
        return "Check Out";
      default:
        return "Dashboard";
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "checkin":
        return <CheckInContent />;
      case "catalog":
        return <CatalogContent />;
      case "finduser":
        return <FindUserContent />;
      case "checkout":
        return <CheckOutContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="bg-white border border-[#EBEBEB] rounded-[1rem] shadow-lg h-full flex flex-col">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-auto">{renderContent()}</div>
    </div>
  );
}
