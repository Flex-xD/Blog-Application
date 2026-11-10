import React, { useContext, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import useEnhanceContentMutation from '@/customHooks/AIEnhancement';
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
    { id: 'professional', name: 'Professional', description: 'Formal and business-like' },
    { id: 'casual', name: 'Casual', description: 'Friendly and informal' },
    { id: 'persuasive', name: 'Persuasive', description: 'Convincing and compelling' },
    { id: 'educational', name: 'Educational', description: 'Informative and clear' },
    { id: 'storytelling', name: 'Storytelling', description: 'Narrative and engaging' },
    { id: 'inspirational', name: 'Inspirational', description: 'Motivational and uplifting' },
];

const fieldClass =
    'mt-2 w-full resize-none rounded-sm border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50';

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
    const { mutateAsync, isPending } = useEnhanceContentMutation();

    /* The mutation's own isError never reached the dialog before — the failure
       surfaced as a toast while the modal sat there looking untouched. */
    const [failed, setFailed] = useState(false);

    const handleEnhance = async () => {
        setFailed(false);

        try {
            const payload = {
                title: blogForm.title || undefined,
                body: contentToEnhance || blogForm.body,
                tone: selectedTone || undefined,
                customInstructions: customInstructions || undefined,
            };

            const response = await mutateAsync(payload);

            if (response.success && response.data) {
                dispatch({
                    type: 'SET_TITLE',
                    payload: response.data.title,
                });

                dispatch({
                    type: 'SET_BODY',
                    payload: response.data.body,
                });

                setContentToEnhance(response.data.body);
                setShow(false);
            } else {
                setFailed(true);
            }
        } catch {
            setFailed(true);
        }
    };

    const isButtonDisabled = isPending || !contentToEnhance.trim();

    return (
        <Dialog
            open={show}
            onOpenChange={(open) => !open && setShow(false)}
        >
            <DialogContent className="max-w-2xl gap-0 overflow-hidden rounded-sm border-border p-0 shadow-none">
                <div className="border-b border-border px-6 py-4">
                    <DialogTitle className="font-serif text-2xl leading-tight tracking-tight">
                        Rewrite with AI
                    </DialogTitle>

                    <DialogDescription className="mt-1">
                        Choose a tone, or write the instruction yourself. Enhancing replaces your draft.
                    </DialogDescription>
                </div>

                <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-5">
                    <div>
                        <div className="flex items-baseline justify-between">
                            <h3 className="text-sm font-medium">Tone</h3>
                            <span className="text-xs text-muted-foreground">
                                Optional
                            </span>
                        </div>

                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {tones.map((tone) => {
                                const selected = selectedTone === tone.id;

                                return (
                                    <button
                                        key={tone.id}
                                        type="button"
                                        /* Pressing the chosen tone again clears it — otherwise
                                           there is no way back to "no tone" once you pick one. */
                                        onClick={() =>
                                            setSelectedTone(selected ? '' : tone.id)
                                        }
                                        aria-pressed={selected}
                                        className={cn(
                                            'rounded-sm border px-3 py-2 text-left transition-colors',
                                            selected
                                                ? 'border-foreground bg-muted'
                                                : 'border-border hover:bg-muted/60'
                                        )}
                                    >
                                        <span className="block text-sm font-medium">
                                            {tone.name}
                                        </span>

                                        <span className="mt-0.5 block text-xs text-muted-foreground">
                                            {tone.description}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="ai-instructions"
                            className="text-sm font-medium"
                        >
                            Instructions
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                                Optional
                            </span>
                        </label>

                        <textarea
                            id="ai-instructions"
                            value={customInstructions}
                            onChange={(event) =>
                                setCustomInstructions(event.target.value)
                            }
                            placeholder="Shorten the opening, keep the examples, cut the adverbs…"
                            rows={3}
                            className={fieldClass}
                        />
                    </div>

                    <div>
                        <div className="flex items-baseline justify-between">
                            <label
                                htmlFor="ai-content"
                                className="text-sm font-medium"
                            >
                                Text to enhance
                            </label>

                            <button
                                type="button"
                                onClick={() =>
                                    setContentToEnhance(blogForm.body)
                                }
                                className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                            >
                                Use current draft
                            </button>
                        </div>

                        <textarea
                            id="ai-content"
                            value={contentToEnhance}
                            onChange={(event) =>
                                setContentToEnhance(event.target.value)
                            }
                            placeholder="Paste the text you want rewritten."
                            rows={7}
                            className={fieldClass}
                        />
                    </div>

                    {failed && (
                        <p role="alert" className="text-sm text-destructive">
                            That didn&rsquo;t go through. Your draft is unchanged — try again.
                        </p>
                    )}
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                        Enhancing sends this text to the AI service.
                    </p>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShow(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            size="sm"
                            onClick={handleEnhance}
                            disabled={isButtonDisabled}
                            /* Not gold: the gold in this flow belongs to Publish, which is
                               sitting one layer below this dialog. */
                            className="bg-foreground text-background hover:bg-foreground/90"
                        >
                            {isPending && (
                                <Loader2
                                    className="size-4 animate-spin"
                                    aria-hidden="true"
                                />
                            )}

                            {isPending ? 'Enhancing' : 'Enhance draft'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateAIModal;
