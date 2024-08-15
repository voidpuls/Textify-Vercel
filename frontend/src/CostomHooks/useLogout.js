import { useSetRecoilState } from "recoil"
import userAtom from "../atom/userAtom"
import useShowToast from "./useShowToast"
import { contactAtom } from "../atom/contactAtom"
import { conversationsAtom, selectedConversationAtom } from "../atom/messageAtom"

const useLogout = () => {
    const setUser = useSetRecoilState(userAtom)
    const setContact = useSetRecoilState(contactAtom)
    const setConversation = useSetRecoilState(conversationsAtom)

    const showToast = useShowToast();
    const logout = async () => {
        try {
            const res = await fetch(`${window.location.origin}/api/users/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error")
                return;
            }
            localStorage.removeItem('TextiFy');
            setUser(null);
            setContact([]);
            setConversation([]);
        } catch (error) {
            console.log(error)
        }
    }
    return logout
}

export default useLogout
