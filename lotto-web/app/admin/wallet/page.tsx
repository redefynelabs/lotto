import { redirect } from "next/navigation";

const page = () => {
  redirect("/admin/wallet/deposits");
};

export default page;
