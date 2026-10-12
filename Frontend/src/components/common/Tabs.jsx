import React from "react";

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="w-full">
      <div className="relative border-b-2 border-slate-100">
        <nav className="-mb-0.5 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              role="tab"
              aria-selected={activeTab === tab.name}
              onClick={(e) => {
                setActiveTab(tab.name);
                e.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
              }}
              className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap px-5 pb-4 pt-2 text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.name
                  ? "text-emerald-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.icon && <tab.icon size={16} />}
              <span className="relative z-10">{tab.label}</span>
              {activeTab === tab.name && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" />
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="py-6">
        {tabs.map((tab) =>
          tab.name === activeTab ? (
            <div key={tab.name} role="tabpanel">
              {tab.content}
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
};

export default Tabs;
