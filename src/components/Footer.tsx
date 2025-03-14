import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <span>
      This is a fan-made project. The concepts, characters, and writing from &quot;Severance&quot; are the property of the show&apos;s producers and Apple. 
      Made with ♥ by <Link href="https://rogerwong.me" target="_blank" className="underline">Roger Wong</Link>
      &nbsp;•&nbsp;
      <Link href="https://github.com/wongdigital/oqsi-frontend" target="_blank" className="underline">Github</Link>
    </span>
  );
} 