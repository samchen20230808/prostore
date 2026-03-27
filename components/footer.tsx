import { APP_NAME } from "@/lib/constants";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t flex justify-center">
      <div className="p-5">
        {currentYear} {APP_NAME}. All Rights Reserved
      </div>
    </footer>
  );
}
