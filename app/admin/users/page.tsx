import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteUser, getAllUsers } from "@/lib/actions/user-actions";
import { formatId } from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "Admin Users" };
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page: string; query: string }>;
}) {
  const { page = "1", query } = await searchParams;
  const users = await getAllUsers({ page: Number(page), limit: 2, query });
  // console.log(users);
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-3">
        <h1 className="h2-bold">Users</h1>
        {query && (
          <div>
            Filter by <i>&quot;{query}&quot;</i>{" "}
            <Link
              href="/admin/users"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Remove
            </Link>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>NAME</TableHead>
              <TableHead>EMAIL</TableHead>
              <TableHead>ROLE</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.data.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{formatId(user.id)}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.role === "user" ? (
                    <Badge variant="secondary">User</Badge>
                  ) : (
                    <Badge variant="destructive">Admin</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    <Link href={`/admin/users/${user.id}`}>
                      <span className="px-2">Edit</span>
                    </Link>
                  </Button>
                  <DeleteDialog id={user.id} action={deleteUser} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {users.totalPages > 1 && <Pagination totalPages={users.totalPages} />}
        {!users.totalCount && <p className="mt-2">No data</p>}
      </div>
    </div>
  );
}
