// app/page.js
"use client";

import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('./components/RichTextEditor'), {
  ssr: false
});

export default function Home() {
  return <RichTextEditor />;
}