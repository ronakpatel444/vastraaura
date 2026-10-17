'use client';

import { useState } from 'react';
import { X, Ruler, Image as ImageIcon, Table as TableIcon } from 'lucide-react';
import Image from 'next/image';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}

export default function SizeChartModal({ isOpen, onClose, category }: SizeChartModalProps) {
  const cat = (category || '').toLowerCase();

  const isShortKurti = cat.includes('short kurti');
  const isCordOrSuit = cat.includes('coord') || cat.includes('cord') || cat.includes('3 piece') || cat.includes('3 pis') || cat.includes('3 pics');

  // Active tab for Cord Set / 3 Piece Suit: 'top' | 'pant' | 'image'
  // Active tab for Short Kurti: 'table' | 'image'
  const [activeTab, setActiveTab] = useState<'top' | 'pant' | 'table' | 'image'>(isShortKurti ? 'table' : 'top');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col border border-gray-100">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8B5E34]/10 text-[#8B5E34] flex items-center justify-center">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-serif text-gray-900 font-semibold">
                {isShortKurti ? 'Short Kurti Size Chart' : 'Size Chart (Cord Set / Kurti + Pant)'}
              </h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">
                Standard Garment Measurements (Inches)
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-6 pt-4 pb-2 border-b border-gray-100 flex gap-2 overflow-x-auto bg-white">
          {isShortKurti ? (
            <>
              <button
                onClick={() => setActiveTab('table')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
                  activeTab === 'table' ? 'bg-[#8B5E34] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <TableIcon className="w-4 h-4" /> Size Table
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
                  activeTab === 'image' ? 'bg-[#8B5E34] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ImageIcon className="w-4 h-4" /> Original Chart
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('top')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
                  activeTab === 'top' ? 'bg-[#8B5E34] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <TableIcon className="w-4 h-4" /> Kurti / Top
              </button>
              <button
                onClick={() => setActiveTab('pant')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
                  activeTab === 'pant' ? 'bg-[#8B5E34] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <TableIcon className="w-4 h-4" /> Pant / Trouser
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
                  activeTab === 'image' ? 'bg-[#8B5E34] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ImageIcon className="w-4 h-4" /> Original Chart
              </button>
            </>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* SHORT KURTI TABLE */}
          {isShortKurti && activeTab === 'table' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="bg-[#8B5E34]/10 text-gray-900 border-b border-gray-200">
                      <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider border-r border-gray-200">Size</th>
                      <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider border-r border-gray-200">Shoulder</th>
                      <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider border-r border-gray-200">Chest</th>
                      <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider border-r border-gray-200">Kamar</th>
                      <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider border-r border-gray-200">Hip</th>
                      <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider border-r border-gray-200">Ghera</th>
                      <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider border-r border-gray-200">Astin</th>
                      <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider">Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    <tr className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-gray-900 bg-neutral-50/50 border-r border-gray-100">S</td>
                      <td className="py-3 px-3 border-r border-gray-100">13.5</td>
                      <td className="py-3 px-3 border-r border-gray-100 font-semibold text-[#8B5E34]">18.5</td>
                      <td className="py-3 px-3 border-r border-gray-100">16</td>
                      <td className="py-3 px-3 border-r border-gray-100">19</td>
                      <td className="py-3 px-3 border-r border-gray-100">19</td>
                      <td className="py-3 px-3 border-r border-gray-100">19</td>
                      <td className="py-3 px-3 font-medium">29</td>
                    </tr>
                    <tr className="hover:bg-neutral-50 transition-colors bg-gray-50/30">
                      <td className="py-3 px-3 font-bold text-gray-900 bg-neutral-50/50 border-r border-gray-100">M</td>
                      <td className="py-3 px-3 border-r border-gray-100">14</td>
                      <td className="py-3 px-3 border-r border-gray-100 font-semibold text-[#8B5E34]">19</td>
                      <td className="py-3 px-3 border-r border-gray-100">17</td>
                      <td className="py-3 px-3 border-r border-gray-100">20.5</td>
                      <td className="py-3 px-3 border-r border-gray-100">20.5</td>
                      <td className="py-3 px-3 border-r border-gray-100">19</td>
                      <td className="py-3 px-3 font-medium">29</td>
                    </tr>
                    <tr className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-gray-900 bg-neutral-50/50 border-r border-gray-100">L</td>
                      <td className="py-3 px-3 border-r border-gray-100">15</td>
                      <td className="py-3 px-3 border-r border-gray-100 font-semibold text-[#8B5E34]">20</td>
                      <td className="py-3 px-3 border-r border-gray-100">18</td>
                      <td className="py-3 px-3 border-r border-gray-100">20.5</td>
                      <td className="py-3 px-3 border-r border-gray-100">21</td>
                      <td className="py-3 px-3 border-r border-gray-100">19</td>
                      <td className="py-3 px-3 font-medium">29</td>
                    </tr>
                    <tr className="hover:bg-neutral-50 transition-colors bg-gray-50/30">
                      <td className="py-3 px-3 font-bold text-gray-900 bg-neutral-50/50 border-r border-gray-100">XL</td>
                      <td className="py-3 px-3 border-r border-gray-100">16</td>
                      <td className="py-3 px-3 border-r border-gray-100 font-semibold text-[#8B5E34]">21</td>
                      <td className="py-3 px-3 border-r border-gray-100">19</td>
                      <td className="py-3 px-3 border-r border-gray-100">21.5</td>
                      <td className="py-3 px-3 border-r border-gray-100">21.5</td>
                      <td className="py-3 px-3 border-r border-gray-100">19</td>
                      <td className="py-3 px-3 font-medium">29</td>
                    </tr>
                    <tr className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-gray-900 bg-neutral-50/50 border-r border-gray-100">2XL</td>
                      <td className="py-3 px-3 border-r border-gray-100">16.5</td>
                      <td className="py-3 px-3 border-r border-gray-100 font-semibold text-[#8B5E34]">22</td>
                      <td className="py-3 px-3 border-r border-gray-100">20</td>
                      <td className="py-3 px-3 border-r border-gray-100">22</td>
                      <td className="py-3 px-3 border-r border-gray-100">22</td>
                      <td className="py-3 px-3 border-r border-gray-100">19</td>
                      <td className="py-3 px-3 font-medium">29</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 italic text-center">* All measurements are in inches. Flat garment measurements.</p>
            </div>
          )}

          {/* CORD SET / 3 PIECE SUIT: TOP TABLE */}
          {!isShortKurti && activeTab === 'top' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="bg-[#8B5E34]/10 text-gray-900 border-b border-gray-200">
                      <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-left border-r border-gray-200">Measurement</th>
                      <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider border-r border-gray-200">XS</th>
                      <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider border-r border-gray-200">S</th>
                      <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider border-r border-gray-200">M</th>
                      <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider border-r border-gray-200">L</th>
                      <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider border-r border-gray-200">XL</th>
                      <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider">XXL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    <tr className="hover:bg-neutral-50 transition-colors font-medium">
                      <td className="py-2.5 px-4 text-left font-semibold text-gray-900 bg-neutral-50/50 border-r border-gray-100">Chest</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">-</td>
                      <td className="py-2.5 px-3 border-r border-gray-100 font-bold text-[#8B5E34]">34</td>
                      <td className="py-2.5 px-3 border-r border-gray-100 font-bold text-[#8B5E34]">36</td>
                      <td className="py-2.5 px-3 border-r border-gray-100 font-bold text-[#8B5E34]">38</td>
                      <td className="py-2.5 px-3 border-r border-gray-100 font-bold text-[#8B5E34]">40</td>
                      <td className="py-2.5 px-3 font-bold text-[#8B5E34]">42</td>
                    </tr>
                    <tr className="hover:bg-neutral-50 transition-colors bg-gray-50/30">
                      <td className="py-2.5 px-4 text-left font-semibold text-gray-900 bg-neutral-50/50 border-r border-gray-100">Waist</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">-</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">30</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">32</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">34</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">36</td>
                      <td className="py-2.5 px-3">38</td>
                    </tr>
                    <tr className="hover:bg-neutral-50 transition-colors">
                      <td className="py-2.5 px-4 text-left font-semibold text-gray-900 bg-neutral-50/50 border-r border-gray-100">Hip</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">-</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">36</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">38</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">40</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">42</td>
                      <td className="py-2.5 px-3">44</td>
                    </tr>
                    <tr className="hover:bg-neutral-50 transition-colors bg-gray-50/30">
                      <td className="py-2.5 px-4 text-left font-semibold text-gray-900 bg-neutral-50/50 border-r border-gray-100">Shoulder</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">-</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">13.5</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">14</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">14.5</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">15</td>
                      <td className="py-2.5 px-3">15.5</td>
                    </tr>
                    <tr className="hover:bg-neutral-50 transition-colors">
                      <td className="py-2.5 px-4 text-left font-semibold text-gray-900 bg-neutral-50/50 border-r border-gray-100">Armhole</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">-</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">15</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">16</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">17</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">18</td>
                      <td className="py-2.5 px-3">19</td>
                    </tr>
                    <tr className="hover:bg-neutral-50 transition-colors bg-gray-50/30">
                      <td className="py-2.5 px-4 text-left font-semibold text-gray-900 bg-neutral-50/50 border-r border-gray-100">Sleeve Length</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">-</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">17</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">17</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">17</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">17</td>
                      <td className="py-2.5 px-3">17</td>
                    </tr>
                    <tr className="hover:bg-neutral-50 transition-colors">
                      <td className="py-2.5 px-4 text-left font-semibold text-gray-900 bg-neutral-50/50 border-r border-gray-100">Sleeve Opening</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">-</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">9.5</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">10</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">10.5</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">11</td>
                      <td className="py-2.5 px-3">11.5</td>
                    </tr>
                    <tr className="hover:bg-neutral-50 transition-colors bg-gray-50/30">
                      <td className="py-2.5 px-4 text-left font-semibold text-gray-900 bg-neutral-50/50 border-r border-gray-100">Across Front</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">-</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">12.5</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">13</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">13.5</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">14</td>
                      <td className="py-2.5 px-3">14.5</td>
                    </tr>
                    <tr className="hover:bg-neutral-50 transition-colors">
                      <td className="py-2.5 px-4 text-left font-semibold text-gray-900 bg-neutral-50/50 border-r border-gray-100">Across Back</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">-</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">13.5</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">14</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">14.5</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">15</td>
                      <td className="py-2.5 px-3">15.5</td>
                    </tr>
                    <tr className="hover:bg-neutral-50 transition-colors bg-gray-50/30">
                      <td className="py-2.5 px-4 text-left font-semibold text-gray-900 bg-neutral-50/50 border-r border-gray-100">Length</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">-</td>
                      <td className="py-2.5 px-3 border-r border-gray-100 font-medium">43</td>
                      <td className="py-2.5 px-3 border-r border-gray-100 font-medium">43</td>
                      <td className="py-2.5 px-3 border-r border-gray-100 font-medium">43</td>
                      <td className="py-2.5 px-3 border-r border-gray-100 font-medium">43</td>
                      <td className="py-2.5 px-3 font-medium">43</td>
                    </tr>
                    <tr className="hover:bg-neutral-50 transition-colors">
                      <td className="py-2.5 px-4 text-left font-semibold text-gray-900 bg-neutral-50/50 border-r border-gray-100">Bottom</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">-</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">20</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">21</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">22</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">23</td>
                      <td className="py-2.5 px-3">24</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 italic text-center">* All measurements are in inches. Full garment measurements.</p>
            </div>
          )}

          {/* CORD SET / 3 PIECE SUIT: PANT TABLE */}
          {!isShortKurti && activeTab === 'pant' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="bg-[#8B5E34]/10 text-gray-900 border-b border-gray-200">
                      <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-left border-r border-gray-200">Measurement</th>
                      <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider border-r border-gray-200">XS</th>
                      <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider border-r border-gray-200">S</th>
                      <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider border-r border-gray-200">M</th>
                      <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider border-r border-gray-200">L</th>
                      <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider border-r border-gray-200">XL</th>
                      <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider">XXL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    <tr className="hover:bg-neutral-50 transition-colors font-medium">
                      <td className="py-2.5 px-4 text-left font-semibold text-gray-900 bg-neutral-50/50 border-r border-gray-100">Length</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">-</td>
                      <td className="py-2.5 px-3 border-r border-gray-100 font-bold text-[#8B5E34]">38</td>
                      <td className="py-2.5 px-3 border-r border-gray-100 font-bold text-[#8B5E34]">38</td>
                      <td className="py-2.5 px-3 border-r border-gray-100 font-bold text-[#8B5E34]">38</td>
                      <td className="py-2.5 px-3 border-r border-gray-100 font-bold text-[#8B5E34]">38</td>
                      <td className="py-2.5 px-3 font-bold text-[#8B5E34]">38</td>
                    </tr>
                    <tr className="hover:bg-neutral-50 transition-colors bg-gray-50/30">
                      <td className="py-2.5 px-4 text-left font-semibold text-gray-900 bg-neutral-50/50 border-r border-gray-100">Waist</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">-</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">14.5</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">14.5</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">15</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">16</td>
                      <td className="py-2.5 px-3">16.5</td>
                    </tr>
                    <tr className="hover:bg-neutral-50 transition-colors">
                      <td className="py-2.5 px-4 text-left font-semibold text-gray-900 bg-neutral-50/50 border-r border-gray-100">Hip</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">-</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">42</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">42</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">46</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">48</td>
                      <td className="py-2.5 px-3">50</td>
                    </tr>
                    <tr className="hover:bg-neutral-50 transition-colors bg-gray-50/30">
                      <td className="py-2.5 px-4 text-left font-semibold text-gray-900 bg-neutral-50/50 border-r border-gray-100">Thigh</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">-</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">24</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">24</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">28</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">30</td>
                      <td className="py-2.5 px-3">32</td>
                    </tr>
                    <tr className="hover:bg-neutral-50 transition-colors">
                      <td className="py-2.5 px-4 text-left font-semibold text-gray-900 bg-neutral-50/50 border-r border-gray-100">Crotch (Front)</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">-</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">12.5</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">12.5</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">13</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">13</td>
                      <td className="py-2.5 px-3">14</td>
                    </tr>
                    <tr className="hover:bg-neutral-50 transition-colors bg-gray-50/30">
                      <td className="py-2.5 px-4 text-left font-semibold text-gray-900 bg-neutral-50/50 border-r border-gray-100">Crotch (Back)</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">-</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">14.5</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">14.5</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">15</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">15</td>
                      <td className="py-2.5 px-3">16</td>
                    </tr>
                    <tr className="hover:bg-neutral-50 transition-colors">
                      <td className="py-2.5 px-4 text-left font-semibold text-gray-900 bg-neutral-50/50 border-r border-gray-100">Bottom Opening</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">-</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">16</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">16</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">18</td>
                      <td className="py-2.5 px-3 border-r border-gray-100">18</td>
                      <td className="py-2.5 px-3">20</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 italic text-center">* All measurements are in inches. Flat garment measurements.</p>
            </div>
          )}

          {/* ORIGINAL CHART IMAGE VIEW */}
          {activeTab === 'image' && (
            <div className="flex flex-col items-center justify-center p-2 bg-neutral-50 rounded-xl border border-gray-200">
              <div className="relative w-full aspect-[4/3] max-h-[460px] rounded-lg overflow-hidden bg-white shadow-inner flex items-center justify-center">
                <Image 
                  src={isShortKurti ? '/images/size-charts/short-kurti-size-chart.png' : '/images/size-charts/cord-set-size-chart.png'} 
                  alt="Size Chart"
                  fill
                  unoptimized
                  className="object-contain p-2"
                />
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">Original vendor size specification chart</p>
            </div>
          )}

          {/* Measuring Tips Card */}
          <div className="mt-6 bg-[#8B5E34]/5 border border-[#8B5E34]/20 rounded-xl p-4 text-xs text-gray-700">
            <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>💡</span> Fit & Measurement Advice
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
              <div>• <strong>Chest / Bust:</strong> Measure around the fullest part of your chest.</div>
              <div>• <strong>Waist:</strong> Measure around your natural waistline.</div>
              <div>• <strong>Hips:</strong> Measure around the widest part of your hips.</div>
              <div>• <strong>Relaxed Fit:</strong> If you are between sizes, we recommend sizing up.</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-neutral-50/70 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-lg transition-colors"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
}
