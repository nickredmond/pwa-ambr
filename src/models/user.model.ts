import { BidPermission } from "src/models/bidPermission.model";

export class User {
    public emailAddress: string;
    public password: string;
    public bidPermissions: BidPermission[];
}