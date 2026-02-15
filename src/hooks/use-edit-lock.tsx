'use client';

import { createContext, useContext, useState, useCallback } from 'react';

type EditLockContextType = {
    activeEditor: string | null;
    requestEdit: (editorId: string) => boolean;
    releaseEdit: (editorId: string) => void;
};

const EditLockContext = createContext<EditLockContextType>({
    activeEditor: null,
    requestEdit: () => true,
    releaseEdit: () => { },
});

export function EditLockProvider({ children }: { children: React.ReactNode }) {
    const [activeEditor, setActiveEditor] = useState<string | null>(null);

    const requestEdit = useCallback((editorId: string) => {
        if (activeEditor !== null && activeEditor !== editorId) {
            return false; // 他のエディタが編集中
        }
        setActiveEditor(editorId);
        return true;
    }, [activeEditor]);

    const releaseEdit = useCallback((editorId: string) => {
        setActiveEditor((current) => current === editorId ? null : current);
    }, []);

    return (
        <EditLockContext.Provider value={{ activeEditor, requestEdit, releaseEdit }}>
            {children}
        </EditLockContext.Provider>
    );
}

export function useEditLock(editorId: string) {
    const { activeEditor, requestEdit, releaseEdit } = useContext(EditLockContext);

    return {
        isEditable: activeEditor === null || activeEditor === editorId,
        isActive: activeEditor === editorId,
        startEdit: () => requestEdit(editorId),
        stopEdit: () => releaseEdit(editorId),
    };
}
