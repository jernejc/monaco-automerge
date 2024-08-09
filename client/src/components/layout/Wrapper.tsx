
import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Header } from "../header/Header";
import { HistorySidebar } from "../history/Sidebar";


export function Wrapper() {

  const [viewHistory, setViewHistory] = useState<boolean>(false);

  return (
    <div className="flex flex-row h-full w-full max-w-full">
      <div className={`flex flex-col w-full ${viewHistory ? 'max-w-[calc(100vw-20rem)]' : ''}`}>
        <div>
          <Header setViewHistory={setViewHistory} />
        </div>

        <Outlet />
      </div>

      {viewHistory &&
        <HistorySidebar setViewHistory={setViewHistory} />
      }
    </div>
  )
}