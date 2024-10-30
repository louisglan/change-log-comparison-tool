'use client';

import Head from 'next/head';
import './globals.css';
import { useState } from 'react';
import { ChangesDto, compareChangeLogs } from './actions/changeComparison';
import { ComparisonResult } from './components/ComparisonResult';

export default function Home() {
  type ChangeLogInput = {
    changeLogTitle: string, 
    changeLog: string
  };

  const [highLevelChangeLog, setHighLevelChangeLog] = useState("");
  const [lowLevelChangeLogs, setLowLevelChangeLogs] = useState<ChangeLogInput[]>([]);
  const [changeOutput, setChangeOutput] = useState<ChangesDto[]>([]);

  const handleHighLevelChangeLogFileSelection = (e: React.FormEvent<HTMLInputElement>): void => {
    const target = e.target as HTMLInputElement & {
      files: FileList
    };
    const file = target.files.item(0);
    const reader = new FileReader();
    if (file) {
      reader.readAsText(file);
      reader.onload = () => {
        const text = reader.result;
        if (typeof text === 'string') {
          setHighLevelChangeLog(text);
        } else {
          console.error("Please select a non-empty txt file");
        }
      };
    }
  };

  const handleLowLevelChangeLogFileSelection = (e: React.FormEvent<HTMLInputElement>): void => {
    const target = e.target as HTMLInputElement & {
      files: FileList
    };
    for (let i = 0; i < target.files.length; i++) {
      const file = target.files.item(i);
      const reader = new FileReader();
      if (file) {
        reader.readAsText(file);
        reader.onload = () => {
          const text = reader.result;
          const name = file.name.slice(0, -4);
          if (typeof text === 'string') {
            setLowLevelChangeLogs(currentChangeLogs => {
              return [...currentChangeLogs, {changeLogTitle: name, changeLog: text}];
            });
          } else {
            console.error("Please select a non-empty txt file");
          }
        };
      }
    }
  };

  const handleRemoveFile = (i: number): void => {
    setLowLevelChangeLogs(lowLevelChangeLogs.toSpliced(i, 1))
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Head>
        <title>Change Log Comparison Tool</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-4">Change Log Comparison Tool</h1>
        <div className="mb-4">
          <h3 className="text-2xl mb-2">High-level change log</h3>
          <input
            type="file"
            className="file-input file-input-bordered w-full max-w-xs"
            onChange={e => handleHighLevelChangeLogFileSelection(e)}
          />
        </div>
        <div className="mb-4">
          <h3 className="text-2xl mb-2">Low-level Change Logs</h3>
          <input 
            type="file"
            multiple
            className="file-input file-input-bordered w-full max-w-xs"
            onChange={e => handleLowLevelChangeLogFileSelection(e)}
          />
          <div className="flex flex-wrap">
            {lowLevelChangeLogs.map((lowLevelChangeLog, i) => {
              return (
                <div key={i} className="p-4">
                  <p className="text-lg font-semibold mb-2 flex justify-self-center">{lowLevelChangeLog.changeLogTitle}</p>
                  <button className="btn btn-accent" onClick={e => handleRemoveFile(i)}>Remove</button>
                </div>
              )
            })}
          </div>
        </div>
        <div className="mb-4">
          <button className="btn btn-primary" onClick={() => setChangeOutput(compareChangeLogs(highLevelChangeLog, lowLevelChangeLogs))}>Compare</button>
        </div>
        <div>
          {changeOutput.map((changeOutput: ChangesDto, i: number) => <ComparisonResult key={i} changeOutput={changeOutput} />)}
        </div>
      </main>
    </div>
  );
}