import type { Metadata } from "next";
import BoardView from "@/components/BoardView";

export const metadata: Metadata = {
  title: "Board",
  description: "Real Japanese sentences, annotated word by word with the pragmatic nuance a dictionary won't tell you.",
};

export default function BoardPage() {
  return <BoardView />;
}
