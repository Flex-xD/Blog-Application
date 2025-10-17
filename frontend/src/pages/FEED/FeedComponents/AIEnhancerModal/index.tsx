import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Shield, X } from 'lucide-react';
import { modalVariants } from '@/types';
import ModalWrapper from '@/pages/NormalComponents/ModelWrapper';
import { backdropVariants } from '@/constants/varients';
import useEnhanceContentMutation from '@/customHooks/AIEnhancement';
import { toast } from 'sonner';
import { BlogFormContext } from '@/context';

interface CreateAIModalProps {
    show: boolean;
    selectedTone: string | null;
    customInstructions: string;
    contentToEnhance: string;
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedTone: React.Dispatch<React.SetStateAction<string>>;
    setCustomInstructions: React.Dispatch<React.SetStateAction<string>>;
    setContentToEnhance: React.Dispatch<React.SetStateAction<string>>;
}

const tones = [
    { id: 'professional', name: 'Professional', emoji: '💼', description: 'Formal and business-like' },
    { id: 'casual', name: 'Casual', emoji: '😊', description: 'Friendly and informal' },
    { id: 'persuasive', name: 'Persuasive', emoji: '🎯', description: 'Convincing and compelling' },
    { id: 'educational', name: 'Educational', emoji: '📚', description: 'Informative and clear' },
    { id: 'storytelling', name: 'Storytelling', emoji: '📖', description: 'Narrative and engaging' },
    { id: 'inspirational', name: 'Inspirational', emoji: '✨', description: 'Motivational and uplifting' },
];

const CreateAIModal: React.FC<CreateAIModalProps> = ({
    show,
    selectedTone,
    customInstructions,
    contentToEnhance,
    setShow,
    setSelectedTone,
    setCustomInstructions,
    setContentToEnhance,
}) => {
    const { blogForm, dispatch } = useContext(BlogFormContext)!;
    const { mutateAsync, isPending, isError, error } = useEnhanceContentMutation();

    const handleEnhance = async () => {
        try {
            const payload = {
                title: blogForm.title || undefined,
                body: contentToEnhance || blogForm.body,
                tone: selectedTone || undefined,
                customInstructions: customInstructions || undefined,
            };

            const response = await mutateAsync(payload);
            if (response.success && response.data) {
                dispatch({ type: 'SET_TITLE', payload: response.data.title });
                dispatch({ type: 'SET_BODY', payload: response.data.body });
                setContentToEnhance(response.data.body);
                setShow(false);
            }
        } catch (err) {
            console.log({ err });
            toast.error("Failed to enhance content, please try again later!");
        }
    };

    const isButtonDisabled = isPending || !contentToEnhance.trim();

    return (
        <ModalWrapper show={show} backdropVariants={backdropVariants} zIndex={70}>
            <motion.div
                variants={modalVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header - Mobile Optimized */}
                <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex justify-between items-start sm:items-center">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex-shrink-0 mt-1">
                            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                                AI Content Enhancement
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                                Choose a tone or customize your enhancement
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShow(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1 sm:p-2 hover:bg-white rounded-lg flex-shrink-0 ml-2"
                    >
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                </div>

                {/* Body - Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                    {/* Tone Selection - Mobile Grid */}
                    <div>
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                            Select Tone
                        </h4>
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                            {tones.map((tone) => (
                                <button
                                    key={tone.id}
                                    onClick={() => setSelectedTone(tone.id)}
                                    className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-150 min-h-[80px] sm:min-h-[90px] ${selectedTone === tone.id
                                        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                                        <span className="text-xl sm:text-2xl">{tone.emoji}</span>
                                        <span className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                            {tone.name}
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                                        {tone.description}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Instructions */}
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                                Custom Instructions
                            </h4>
                            <span className="text-xs sm:text-sm text-gray-500">Optional</span>
                        </div>
                        <textarea
                            value={customInstructions}
                            onChange={(e) => setCustomInstructions(e.target.value)}
                            placeholder="Specify exactly how you want the AI to enhance your content..."
                            className="w-full min-h-[100px] sm:min-h-[120px] p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150 resize-none placeholder-gray-400 text-sm sm:text-base"
                        />
                    </div>

                    {/* Content Preview */}
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                                Content to Enhance
                            </h4>
                            <button
                                onClick={() => setContentToEnhance(blogForm.body)}
                                className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-150 text-left sm:text-right whitespace-nowrap"
                            >
                                Use current content
                            </button>
                        </div>
                        <textarea
                            value={contentToEnhance}
                            onChange={(e) => setContentToEnhance(e.target.value)}
                            placeholder="Paste your content here for AI enhancement..."
                            className="w-full min-h-[120px] sm:min-h-[140px] p-3 sm:p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150 resize-none placeholder-gray-400 text-sm sm:text-base"
                        />
                    </div>
                </div>

                {/* Footer - Mobile Stacked Layout */}
                <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50">
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4">
                        {/* Security Info */}
                        <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs sm:text-sm text-gray-600">
                            <Shield className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="text-center sm:text-left">Your content is secure and private</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col-reverse xs:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                            <Button
                                variant="outline"
                                onClick={() => setShow(false)}
                                className="w-full sm:w-auto order-2 xs:order-1"
                                size="sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleEnhance}
                                disabled={isButtonDisabled}
                                className="w-full sm:w-auto order-1 xs:order-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                                size="sm"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-2" />
                                        <span className="text-xs sm:text-sm">Enhancing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                        <span className="text-xs sm:text-sm">Enhance Content</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </ModalWrapper>
    );
};

export default CreateAIModal;