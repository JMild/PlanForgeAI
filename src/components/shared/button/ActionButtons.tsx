import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  Save,
  XCircle,
} from "lucide-react";
import IconButton from "./IconButton";

export const AddButton = (props: React.ComponentProps<typeof IconButton>) => (
  <IconButton
    variant="add"
    icon={<Plus size={16} />}
    {...props}
  >
    {props.children}
  </IconButton>
);

export const EditButton = (props: React.ComponentProps<typeof IconButton>) => (
  <IconButton
    variant="edit"
    tooltip="edit"
    icon={<Edit3 size={16} />}
    {...props}
  >
    {props.children}
  </IconButton>
);

export const DeleteButton = (props: React.ComponentProps<typeof IconButton>) => (
  <IconButton
    variant="delete"
    tooltip="delete"
    icon={<Trash2 size={16} />}
    {...props}
  >
    {props.children}
  </IconButton>
);

export const ViewButton = (props: React.ComponentProps<typeof IconButton>) => (
  <IconButton
    variant="view"
    icon={<Eye size={16} />}
    tooltip="ดู"
    {...props}
  >
    {props.children || "View"}
  </IconButton>
);

export const SaveButton = (props: React.ComponentProps<typeof IconButton>) => (
  <IconButton
    variant="save"
    icon={<Save size={16} />}
    {...props}
  >
    {props.children || "Save"}
  </IconButton>
);

export const CancelButton = (props: React.ComponentProps<typeof IconButton>) => (
  <IconButton
    variant="cancel"
    {...props}
  >
    {props.children || "Cancel"}
  </IconButton>
);
