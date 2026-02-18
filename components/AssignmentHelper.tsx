
import React, { useState, useRef, useEffect } from 'react';
import { analyzeImage, analyzeVideo, transcribeAudio } from '../services/geminiService';
import { AssignmentSubmission } from '../types';

const AssignmentHelper: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'image' | 'video' | 'audio'>('image');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [submitted, setSubmitted] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('edu_submissions');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, [submitted]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalysis = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;
    const prompt = formData.get('prompt') as string;

    if (!file || !prompt) return alert('Please provide both a file and a prompt.');

    setLoading(true);
    setResult(null);
    setSubmitted(false);
    try {
      const base64 = await fileToBase64(file);
      let response = '';
      if (activeTool === 'image') {
        response = await analyzeImage(base64, prompt);
      } else if (activeTool === 'video') {
        response = await analyzeVideo(base64, prompt, file.type);
      }
      setResult(response);
    } catch (error) {
      console.error(error);
      setResult("Error processing file. Please ensure your API key is valid.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = () => {
    if (!result) return;
    
    const submission: AssignmentSubmission = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      tool: activeTool,
      analysis: result,
      studentNotes: notes
    };

    const existingSubmissions = JSON.parse(localStorage.getItem('edu_submissions') || '[]');
    localStorage.setItem('edu_submissions', JSON.stringify([submission, ...existingSubmissions]));
    
    setSubmitted(true);
    setNotes('');
    alert('Assignment submitted successfully!');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          setLoading(true);
          try {
            const transcript = await transcribeAudio(base64);
            setResult(transcript);
            setSubmitted(false);
          } catch (err) {
            setResult("Failed to transcribe audio.");
          } finally {
            setLoading(false);
          }
        };
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  if (showHistory) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setShowHistory(false)}
            className="flex items-center gap-2 text-emerald-800 font-bold hover:text-emerald-950 transition-colors"
          >
            <span className="material-icons">arrow_back</span>
            Back to Tools
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Submission History</h2>
        </div>

        {history.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-20 text-center">
            <span className="material-icons text-6xl text-slate-100 mb-4">history_toggle_off</span>
            <p className="text-slate-500 font-medium">No previous submissions found.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {history.map((sub) => (
              <div key={sub.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <span className="material-icons text-xl">
                        {sub.tool === 'image' ? 'image' : sub.tool === 'video' ? 'videocam' : 'mic'}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 capitalize">{sub.tool} Analysis</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{sub.timestamp}</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-emerald-600 transition-colors">
                    <span className="material-icons">more_vert</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Analysis Result</h5>
                    <div className="bg-slate-50 p-4 rounded-2xl text-sm text-slate-700 leading-relaxed max-h-32 overflow-y-auto">
                      {sub.analysis}
                    </div>
                  </div>
                  {sub.studentNotes && (
                    <div>
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">My Notes</h5>
                      <p className="text-sm italic text-slate-600 pl-4 border-l-2 border-emerald-200">{sub.studentNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in zoom-in duration-300">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-slate-800">Assignment Assistant</h2>
            <p className="text-slate-500 mt-2">Leverage Gemini Pro to analyze your study materials</p>
          </div>
          <button 
            onClick={() => setShowHistory(true)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2"
          >
            <span className="material-icons text-lg">history</span>
            History
          </button>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          {(['image', 'video', 'audio'] as const).map((tool) => (
            <button
              key={tool}
              onClick={() => { setActiveTool(tool); setResult(null); setSubmitted(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all capitalize ${
                activeTool === tool ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="material-icons text-sm">
                {tool === 'image' ? 'image' : tool === 'video' ? 'videocam' : 'mic'}
              </span>
              {tool}
            </button>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          {activeTool !== 'audio' ? (
            <form onSubmit={handleAnalysis} className="space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group"
              >
                <input 
                  type="file" 
                  name="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept={activeTool === 'image' ? "image/*" : "video/*"}
                />
                <span className="material-icons text-4xl text-slate-300 group-hover:text-emerald-500 mb-4">upload_file</span>
                <p className="font-bold text-slate-600">Click to upload {activeTool}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Supports PNG, JPG, MP4 or MOV</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analysis Prompt</label>
                <textarea 
                  name="prompt"
                  rows={3}
                  placeholder={activeTool === 'image' ? "Explain this diagram or summarize the text in this image..." : "List the key talking points in this video..."}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all resize-none font-medium text-sm"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-emerald-700 text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              >
                {loading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span>
                ) : (
                  <span className="material-icons">auto_fix_high</span>
                )}
                {loading ? 'Processing...' : `Analyze ${activeTool}`}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 space-y-8">
              <div className={`relative ${isRecording ? 'animate-pulse' : ''}`}>
                <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all ${
                  isRecording ? 'bg-red-500 text-white scale-110 shadow-red-200' : 'bg-emerald-50 text-emerald-800'
                }`}>
                  <span className="material-icons text-5xl">{isRecording ? 'stop' : 'mic'}</span>
                </div>
                {isRecording && (
                  <div className="absolute -inset-4 border-4 border-red-200 rounded-full animate-ping opacity-75"></div>
                )}
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-800">{isRecording ? 'Recording Audio...' : 'Voice Dictation'}</h3>
                <p className="text-slate-500 text-sm mt-1">Record assignment notes or lectures for transcription</p>
              </div>

              <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all ${
                  isRecording ? 'bg-slate-800 text-white hover:bg-slate-900' : 'bg-emerald-700 text-white hover:bg-emerald-800'
                }`}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
            </div>
          )}
        </div>

        {result && !submitted && (
          <div className="bg-white border border-emerald-100 rounded-3xl p-8 shadow-md animate-in slide-in-from-top-4 duration-500 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4 text-emerald-800">
                <span className="material-icons">description</span>
                <h4 className="font-bold text-lg">AI Analysis Result</h4>
              </div>
              <div className="prose prose-slate max-w-none bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm font-medium">{result}</p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission Notes</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add context or notes for your submission record..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all resize-none text-sm"
                ></textarea>
              </div>
              <button 
                onClick={handleSubmitAssignment}
                className="w-full py-4 bg-emerald-800 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg hover:bg-emerald-900 transition-all flex items-center justify-center gap-3"
              >
                <span className="material-icons">save</span>
                Save to History
              </button>
            </div>
          </div>
        )}

        {submitted && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-10 text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg mb-2">
              <span className="material-icons text-3xl">done_all</span>
            </div>
            <h3 className="text-2xl font-bold text-emerald-900">Analysis Saved!</h3>
            <p className="text-emerald-700 font-medium">Your entry has been added to the submission history.</p>
            <div className="flex justify-center gap-3 mt-4">
              <button 
                onClick={() => { setSubmitted(false); setResult(null); }}
                className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 transition-colors"
              >
                New Analysis
              </button>
              <button 
                onClick={() => { setShowHistory(true); setSubmitted(false); setResult(null); }}
                className="px-6 py-2.5 bg-white border border-emerald-200 text-emerald-800 rounded-xl font-bold hover:bg-emerald-50 transition-colors"
              >
                View History
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentHelper;
