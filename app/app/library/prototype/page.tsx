"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, Table, FileSpreadsheet, Code, MoreVertical, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TabsUI } from '@/components/ui/tabs';

export default function ProductLibraryPage() {
  const [activeTab, setActiveTab] = useState('all');

  const fileTypes = [
    {
      icon: FileText,
      title: 'Documents',
      formats: 'PDF, DOC, DOCX, TXT',
    },
    {
      icon: Table,
      title: 'Spreadsheets',
      formats: 'CSV, XLS, XLSX',
    },
    {
      icon: FileSpreadsheet,
      title: 'Presentations',
      formats: 'PPT, PPTX, KEY',
    },
    {
      icon: Code,
      title: 'Technical',
      formats: 'MD, JSON, HTML',
    },
  ];

  const uploadedFiles = [
    {
      icon: Table,
      name: 'Product Features 2024.xlsx',
      uploadedDate: '2 days ago',
      size: '2.4 MB',
      status: 'Indexed',
      type: 'spreadsheets',
    },
    {
      icon: FileText,
      name: 'Help Documentation.pdf',
      uploadedDate: '3 days ago',
      size: '1.8 MB',
      status: 'Indexed',
      type: 'documents',
    },
    {
      icon: FileText,
      name: 'Response Template.docx',
      uploadedDate: '30 days ago',
      size: '956 KB',
      status: 'Indexed',
      type: 'documents',
    },
    {
      icon: FileSpreadsheet,
      name: 'Q3 Sales Deck.pptx',
      uploadedDate: '1 week ago',
      size: '3.2 MB',
      status: 'Indexed',
      type: 'presentations',
    },
    {
      icon: Code,
      name: 'API Documentation.md',
      uploadedDate: '10 days ago',
      size: '512 KB',
      status: 'Indexed',
      type: 'technical',
    },
    {
      icon: Table,
      name: 'Customer Pricing.csv',
      uploadedDate: '2 weeks ago',
      size: '1.1 MB',
      status: 'Indexed',
      type: 'spreadsheets',
    },
    {
      icon: FileText,
      name: 'Product Roadmap.pdf',
      uploadedDate: '3 weeks ago',
      size: '2.7 MB',
      status: 'Indexed',
      type: 'documents',
    },
    {
      icon: FileSpreadsheet,
      name: 'Investor Pitch.ppt',
      uploadedDate: '4 weeks ago',
      size: '5.6 MB',
      status: 'Indexed',
      type: 'presentations',
    },
    {
      icon: Code,
      name: 'Integration Specs.json',
      uploadedDate: '1 month ago',
      size: '768 KB',
      status: 'Indexed',
      type: 'technical',
    },
    {
      icon: FileText,
      name: 'Compliance Report.docx',
      uploadedDate: '6 weeks ago',
      size: '1.5 MB',
      status: 'Indexed',
      type: 'documents',
    },
  ];

  const filteredFiles = activeTab === 'all' 
    ? uploadedFiles 
    : uploadedFiles.filter(file => file.type === activeTab);

  return (
    <section className="flex-1 p-4 lg:p-8 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Link href="/app/library">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
          
          <h1 className="text-2xl lg:text-3xl font-semibold text-white mb-2">
            Product library
          </h1>
          <p className="text-gray-400 max-w-3xl">
            Upload your product knowledge such as product feature spreadsheets, help articles, presentations,
            webpages, PRDs, etc. This is the reference library that the system will look
            at when responding to future prospect/client requests.
          </p>
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-700 rounded-lg p-12 text-center bg-gray-900/50 hover:bg-gray-900/70 transition-colors cursor-pointer">
          <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">
            Drag and drop files here
          </h3>
          <p className="text-gray-400 text-sm">
            or click to browse your computer
          </p>
        </div>

        {/* Supported File Types */}
        <div>
          <h2 className="text-xl font-medium text-white mb-6">
            Supported file types
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {fileTypes.map((type, index) => (
              <div key={index} className="border border-gray-700 rounded-lg p-4 bg-gray-900/30">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center mb-3">
                  <type.icon className="w-5 h-5 text-gray-400" />
                </div>
                <h4 className="font-medium text-white mb-1">{type.title}</h4>
                <p className="text-xs text-gray-400">{type.formats}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Uploaded Files */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-medium text-white">Uploaded files</h2>
              <Badge variant="neutral">{uploadedFiles.length} files</Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search files..." 
                className="pl-10 w-full sm:w-64 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Tabs */}
          <TabsUI className="mb-6">
            <TabsUI.Item 
              active={activeTab === 'all'} 
              onClick={() => setActiveTab('all')}
            >
              All files
            </TabsUI.Item>
            <TabsUI.Item 
              active={activeTab === 'documents'} 
              onClick={() => setActiveTab('documents')}
            >
              Documents
            </TabsUI.Item>
            <TabsUI.Item 
              active={activeTab === 'spreadsheets'} 
              onClick={() => setActiveTab('spreadsheets')}
            >
              Spreadsheets
            </TabsUI.Item>
            <TabsUI.Item 
              active={activeTab === 'presentations'} 
              onClick={() => setActiveTab('presentations')}
            >
              Presentations
            </TabsUI.Item>
          </TabsUI>

          {/* Files List */}
          <div className="space-y-2">
            {filteredFiles.map((file, index) => (
              <div 
                key={index} 
                className="flex items-center gap-4 p-4 border border-gray-700 rounded-lg bg-gray-900/30 hover:bg-gray-900/50 transition-colors"
              >
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <file.icon className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">{file.name}</h4>
                  <p className="text-sm text-gray-400">
                    Uploaded {file.uploadedDate} • {file.size}
                  </p>
                </div>
                <Badge variant="success">{file.status}</Badge>
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}