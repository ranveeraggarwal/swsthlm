// The bottom-right corner, owned in one place.
//
// Both toasts used to position themselves, which worked only while exactly one
// could ever be visible. The language prompt appears on first visit and the
// install prompt fires on `beforeinstallprompt`, and nothing stops those
// coinciding — they'd have been drawn on top of each other. Stacking them here
// means neither component knows or cares that the other exists.
//
// `pointer-events-none` on the stack with `pointer-events-auto` on each child
// keeps the empty column from swallowing clicks on the page beneath it.

import React from 'react';

export function ToastStack({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 flex flex-col gap-3 pointer-events-none">
      <div className="contents [&>*]:pointer-events-auto">{children}</div>
    </div>
  );
}
