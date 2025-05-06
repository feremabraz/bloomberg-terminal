import BloombergTerminal from "@/components/bloomberg/layout/bloomberg-terminal";
import { Provider } from "jotai";
import { QueryClientProvider } from "../components/bloomberg/providers/query-client-provider";

export default function Home() {
  return (
    <Provider>
      <QueryClientProvider>
        <BloombergTerminal />
      </QueryClientProvider>
    </Provider>
  );
}
