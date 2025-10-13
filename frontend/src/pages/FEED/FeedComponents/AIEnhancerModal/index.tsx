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
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">AI Content Enhancement</h3>
                            <p className="text-sm text-gray-600">Choose a tone or customize your enhancement</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShow(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-2 hover:bg-white rounded-lg"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Tone Selection */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Tone</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {tones.map((tone) => (
                                <button
                                    key={tone.id}
                                    onClick={() => setSelectedTone(tone.id)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all duration-150 ${selectedTone === tone.id
                                            ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className="text-2xl">{tone.emoji}</span>
                                        <span className="font-semibold text-gray-900">{tone.name}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{tone.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Instructions */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-gray-900">Custom Instructions</h4>
                            <span className="text-sm text-gray-500">Optional</span>
                        </div>
                        <textarea
                            value={customInstructions}
                            onChange={(e) => setCustomInstructions(e.target.value)}
                            placeholder="Specify exactly how you want the AI to enhance your content..."
                            className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150 resize-none placeholder-gray-400"
                        />
                    </div>

                    {/* Content Preview */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-gray-900">Content to Enhance</h4>
                            <button
                                onClick={() => setContentToEnhance(blogForm.body)} // Use blogForm.body from context
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-150"
                            >
                                Use current content
                            </button>
                        </div>
                        <textarea
                            value={contentToEnhance}
                            onChange={(e) => setContentToEnhance(e.target.value)}
                            placeholder="Paste your content here for AI enhancement..."
                            className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150 resize-none placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Shield className="h-4 w-4" />
                        <span>Your content is secure and private</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button variant="outline" onClick={() => setShow(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEnhance}
                            disabled={isButtonDisabled}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Enhancing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Enhance Content
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </ModalWrapper>
    );
};

export default CreateAIModal;