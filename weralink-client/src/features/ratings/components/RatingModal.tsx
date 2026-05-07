import { useState, useCallback } from 'react';
import { Star, MessageSquare, Zap, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubmitRating } from '@/features/ratings/api/rating.api';
import { toast } from 'sonner';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  rateeName: string;
  gigTitle: string;
  /** 'worker' if employer is rating worker, 'employer' if worker is rating employer */
  rateeRole: 'worker' | 'employer';
  onSuccess?: () => void;
}

const dimensionLabels = {
  quality: { label: 'Work Quality', desc: 'Accuracy, completeness, and attention to detail' },
  communication: { label: 'Communication', desc: 'Responsiveness, clarity, and professionalism' },
  timeliness: { label: 'Timeliness', desc: 'Adherence to deadlines and turnaround speed' },
};

export function RatingModal({
  isOpen,
  onClose,
  assignmentId,
  rateeName,
  gigTitle,
  rateeRole,
  onSuccess,
}: RatingModalProps) {
  const [overallScore, setOverallScore] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [dimensions, setDimensions] = useState<Record<string, number>>({
    quality: 0,
    communication: 0,
    timeliness: 0,
  });
  const [dimensionHover, setDimensionHover] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [step, setStep] = useState<'score' | 'dimensions' | 'comment'>('score');

  const submitMutation = useSubmitRating();

  const handleSubmit = useCallback(async () => {
    if (overallScore < 1) {
      toast.error('Please select an overall rating.');
      return;
    }

    // Build dimensions (only include non-zero values)
    const dimPayload: Record<string, number> = {};
    let hasDimensions = false;
    for (const [key, val] of Object.entries(dimensions)) {
      if (val > 0) {
        dimPayload[key] = val;
        hasDimensions = true;
      }
    }

    try {
      await submitMutation.mutateAsync({
        assignmentId,
        score: overallScore,
        dimensions: hasDimensions ? dimPayload : undefined,
        comment: comment.trim() || undefined,
      });

      toast.success(`Rating submitted! Thank you for your feedback.`);
      onSuccess?.();
      onClose();
      // Reset state
      setOverallScore(0);
      setDimensions({ quality: 0, communication: 0, timeliness: 0 });
      setComment('');
      setStep('score');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit rating.');
    }
  }, [overallScore, dimensions, comment, assignmentId, submitMutation, onClose, onSuccess]);

  if (!isOpen) return null;

  const displayScore = hoveredStar || overallScore;

  const scoreLabels: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="bg-accent-dark text-white px-8 pt-8 pb-10 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-primary-wera/15 rounded-full blur-2xl" />
          <div className="absolute left-1/4 bottom-0 w-24 h-24 bg-primary-wera/10 rounded-full blur-2xl" />

          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary-wera/20 p-1.5 rounded-lg">
                <Star className="w-4 h-4 text-primary-wera" />
              </div>
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-primary-wera">
                Rate {rateeRole === 'worker' ? 'Worker' : 'Employer'}
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-1">How was your experience?</h2>
            <p className="text-white/60 text-sm font-medium">
              Rating <span className="text-white font-bold">{rateeName}</span> for{' '}
              <span className="text-white/80 italic">"{gigTitle}"</span>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          {/* Step 1: Overall Score */}
          {step === 'score' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-xs font-black text-text-main/40 uppercase tracking-[0.2em] mb-6 text-center">
                Overall Rating
              </p>

              {/* Star Selection */}
              <div className="flex justify-center gap-3 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setOverallScore(star)}
                    className="group relative"
                  >
                    <Star
                      className={`w-12 h-12 transition-all duration-200 ${
                        star <= displayScore
                          ? 'text-amber-400 fill-amber-400 scale-110'
                          : 'text-slate-200 hover:text-amber-200'
                      } ${star <= displayScore ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]' : ''}`}
                    />
                    {star <= displayScore && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>

              {/* Score Label */}
              <div className="text-center mb-8 h-8">
                {displayScore > 0 && (
                  <div className="animate-in fade-in duration-200">
                    <span className="text-2xl font-black text-accent-dark">{displayScore}</span>
                    <span className="text-sm font-bold text-text-main/40 ml-2">
                      — {scoreLabels[displayScore]}
                    </span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => setStep('dimensions')}
                disabled={overallScore < 1}
                className="w-full h-14 bg-accent-dark hover:bg-black text-white font-black rounded-2xl text-base transition-all disabled:opacity-30"
              >
                Continue <Zap className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Dimensions (Optional) */}
          {step === 'dimensions' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-xs font-black text-text-main/40 uppercase tracking-[0.2em] mb-2 text-center">
                Detailed Breakdown
              </p>
              <p className="text-center text-sm text-text-main/50 mb-6">Optional — helps improve matching</p>

              <div className="space-y-6">
                {Object.entries(dimensionLabels).map(([key, meta]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-black text-accent-dark">{meta.label}</p>
                        <p className="text-[11px] text-text-main/40">{meta.desc}</p>
                      </div>
                      <span className="text-sm font-black text-primary-wera min-w-[24px] text-right">
                        {dimensions[key] > 0 ? dimensions[key] : '—'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          onMouseEnter={() => setDimensionHover((p) => ({ ...p, [key]: val }))}
                          onMouseLeave={() => setDimensionHover((p) => ({ ...p, [key]: 0 }))}
                          onClick={() => setDimensions((p) => ({ ...p, [key]: val }))}
                          className="flex-1"
                        >
                          <div
                            className={`h-3 rounded-full transition-all duration-200 ${
                              val <= (dimensionHover[key] || dimensions[key])
                                ? 'bg-primary-wera shadow-[0_0_8px_rgba(239,98,108,0.3)]'
                                : 'bg-slate-100 hover:bg-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setStep('score')}
                  className="flex-1 h-12 rounded-xl font-bold border-slate-200"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep('comment')}
                  className="flex-1 h-12 bg-accent-dark hover:bg-black text-white font-black rounded-xl"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Comment */}
          {step === 'comment' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-primary-wera" />
                <p className="text-xs font-black text-text-main/40 uppercase tracking-[0.2em]">
                  Leave a Comment <span className="text-text-main/20">(Optional)</span>
                </p>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={`Share your experience working with ${rateeName}...`}
                className="w-full h-32 p-4 border-2 border-slate-100 rounded-2xl text-sm font-medium text-text-main placeholder:text-text-main/30 focus:border-primary-wera/30 focus:outline-none resize-none transition-colors"
                maxLength={1000}
              />
              <p className="text-right text-[10px] text-text-main/30 mt-1 font-bold">
                {comment.length}/1000
              </p>

              {/* Summary Preview */}
              <div className="bg-slate-50 rounded-2xl p-4 mt-4 mb-6 border border-slate-100">
                <p className="text-[10px] font-black text-text-main/30 uppercase tracking-[0.2em] mb-3">
                  Rating Summary
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= overallScore ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-black text-accent-dark">{overallScore}/5</span>
                  </div>
                  <span className="text-xs font-bold text-text-main/40">
                    {Object.values(dimensions).filter((v) => v > 0).length}/3 dimensions rated
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('dimensions')}
                  className="flex-1 h-12 rounded-xl font-bold border-slate-200"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  className="flex-1 h-14 bg-primary-wera hover:bg-primary-dark text-white font-black rounded-xl shadow-lg shadow-primary-wera/20 transition-all active:scale-95"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      Submit Rating <Star className="w-4 h-4 ml-2 fill-current" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Step Indicator */}
        <div className="px-8 pb-6 flex justify-center gap-2">
          {['score', 'dimensions', 'comment'].map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-300 ${
                step === s ? 'w-8 bg-primary-wera' : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
