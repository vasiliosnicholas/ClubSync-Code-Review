const MEMBER_TAB = {
  role: "member",
  to: "/member/member-dashboard",
  label: "Member",
};

const TREASURER_TAB = {
  role: "treasurer",
  to: "/treasurer/treasurer-dashboard",
  label: "Treasurer",
  children: [MEMBER_TAB],
};

const ADMIN_TAB = {
  role: "admin",
  to: "/admin/admin-dashboard",
  label: "Admin",
  children: [TREASURER_TAB],
};

export const ROLE_ACCESS = {
  member: [MEMBER_TAB],

  treasurer: [TREASURER_TAB],

  admin: [ADMIN_TAB],
};
