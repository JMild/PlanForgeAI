"use client";

import React, { useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  balance: string;
  phone: string;
  verified: string[];
  lastLogin: string;
  status: "Active" | "Pending" | "Suspend" | "Deleted";
};

const sampleUsers: User[] = [
  {
    id: "uid10",
    name: "Emma Walker",
    email: "walker@example.com",
    balance: "55.00 USD",
    phone: "+463 471-7173",
    verified: ["Email", "KYC"],
    lastLogin: "25 Dec 2019",
    status: "Active",
  },
];

export default function UserTableCard() {
  const [bulkAction, setBulkAction] = useState("");
  const [search, setSearch] = useState("");

  const handleBulkAction = () => {
    if (!bulkAction) return;
    alert(`Apply bulk action: ${bulkAction}`);
  };

  const filteredUsers = sampleUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card card-stretch">
      <div className="card-inner-group">
        {/* Card Header */}
        <div className="card-inner card-tools-toggle">
          <div className="card-title-group flex justify-between">
            {/* Bulk Action */}
            <div className="flex gap-2">
              <select
                className="form-select"
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
              >
                <option value="">Bulk Action</option>
                <option value="email">Send Email</option>
                <option value="group">Change Group</option>
                <option value="suspend">Suspend User</option>
                <option value="delete">Delete User</option>
              </select>
              <button
                onClick={handleBulkAction}
                className="btn btn-dim btn-outline-light"
                disabled={!bulkAction}
              >
                Apply
              </button>
            </div>

            {/* Search */}
            <div className="card-search">
              <input
                type="text"
                className="form-control"
                placeholder="Search by user or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card-inner p-0">
          <div className="nk-tb-list nk-tb-ulist">
            {/* Table Head */}
            <div className="nk-tb-item nk-tb-head">
              <div className="nk-tb-col nk-tb-col-check">
                <input type="checkbox" />
              </div>
              <div className="nk-tb-col">User</div>
              <div className="nk-tb-col">Balance</div>
              <div className="nk-tb-col">Phone</div>
              <div className="nk-tb-col">Verified</div>
              <div className="nk-tb-col">Last Login</div>
              <div className="nk-tb-col">Status</div>
              <div className="nk-tb-col text-end">Actions</div>
            </div>

            {/* Table Rows */}
            {filteredUsers.map((user) => (
              <div key={user.id} className="nk-tb-item">
                <div className="nk-tb-col nk-tb-col-check">
                  <input type="checkbox" />
                </div>
                <div className="nk-tb-col">
                  <div className="user-card">
                    <div className="user-avatar bg-purple">
                      <span>{user.name[0] + user.name.split(" ")[1][0]}</span>
                    </div>
                    <div className="user-info">
                      <span className="tb-lead">{user.name}</span>
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>
                <div className="nk-tb-col">{user.balance}</div>
                <div className="nk-tb-col">{user.phone}</div>
                <div className="nk-tb-col">
                  <ul>
                    {user.verified.map((v) => (
                      <li key={v} className="text-green-600">
                        ✔ {v}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="nk-tb-col">{user.lastLogin}</div>
                <div className="nk-tb-col">
                  <span
                    className={`tb-status ${
                      user.status === "Active"
                        ? "text-success"
                        : user.status === "Pending"
                        ? "text-warning"
                        : "text-danger"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
                <div className="nk-tb-col text-end">
                  <button className="btn btn-sm btn-outline-primary">
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="card-inner">
          <div className="flex justify-between items-center">
            <ul className="pagination">
              <li className="page-item">
                <a href="#" className="page-link">
                  Prev
                </a>
              </li>
              <li className="page-item active">
                <a href="#" className="page-link">
                  1
                </a>
              </li>
              <li className="page-item">
                <a href="#" className="page-link">
                  2
                </a>
              </li>
              <li className="page-item">
                <a href="#" className="page-link">
                  Next
                </a>
              </li>
            </ul>
            <div className="flex items-center gap-2">
              <span>Page</span>
              <select className="form-select">
                <option>1</option>
                <option>2</option>
              </select>
              <span>of 102</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
