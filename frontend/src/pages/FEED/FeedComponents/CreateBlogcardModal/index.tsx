import React, { useContext } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2, ImageIcon, Sparkles, X } from "lucide-react";
import { BlogFormContext } from "@/context";

interface CreateBlogCardModalProps {
    show: boolean;
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    setShowAIModal: React.Dispatch<React.SetStateAction<boolean>>;
    onPostSuccess: () => void;
}

const CreateBlogCardModal: React.FC<CreateBlogCardModalProps> = ({
    show,
    setShow,
    setShowAIModal,
    onPostSuccess,
}) => {
    const handleClose = () => setShow(false);

    const {
        blogForm,
        handleImageUpload,
        handleBlogPost,
        dispatch,
        postBlogPending,
    } = useContext(BlogFormContext)!;

    return (
        <Dialog
            open={show}
            onOpenChange={(open) => !open && handleClose()}
        >
            <DialogContent className="max-w-2xl gap-0 overflow-hidden rounded-sm border-border p-0 shadow-none">
                <DialogTitle className="sr-only">New post</DialogTitle>

                <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
                    <input
                        value={blogForm.title}
                        onChange={(event) =>
                            dispatch({
                                type: "SET_TITLE",
                                payload: event.target.value,
                            })
                        }
                        placeholder="Title"
                        aria-label="Title"
                        className="w-full bg-transparent font-serif text-2xl tracking-tight outline-none placeholder:text-muted-foreground/70"
                    />

                    <textarea
                        value={blogForm.body}
                        onChange={(event) =>
                            dispatch({
                                type: "SET_BODY",
                                payload: event.target.value,
                            })
                        }
                        placeholder="Write it down…"
                        aria-label="Body"
                        className="mt-3 min-h-[240px] w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground/70"
                    />

                    {blogForm.imagePreview && (
                        <div className="relative mt-4 inline-block">
                            <img
                                src={blogForm.imagePreview}
                                alt="Selected cover"
                                className="max-h-40 rounded-sm border border-border object-cover"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    dispatch({
                                        type: "SET_IMAGE",
                                        payload: {
                                            file: null,
                                            preview: null,
                                        },
                                    })
                                }
                                aria-label="Remove image"
                                className="absolute -right-2 -top-2 rounded-full border border-border bg-background p-1 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <X
                                    className="size-3"
                                    aria-hidden="true"
                                />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2.5">
                    <div className="flex items-center gap-1">
                        <label className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-within:ring-[3px] focus-within:ring-ring/50">
                            <ImageIcon
                                className="size-4"
                                aria-hidden="true"
                            />
                            Image

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="sr-only"
                            />
                        </label>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAIModal(true)}
                        >
                            <Sparkles
                                className="size-4"
                                aria-hidden="true"
                            />
                            Enhance
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>

                        <Button
                            size="sm"
                            onClick={async () => {
                                await handleBlogPost();
                                onPostSuccess();
                                setShow(false);
                            }}
                            disabled={postBlogPending}
                        >
                            {postBlogPending && (
                                <Loader2
                                    className="size-4 animate-spin"
                                    aria-hidden="true"
                                />
                            )}
                            Publish
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateBlogCardModal;
