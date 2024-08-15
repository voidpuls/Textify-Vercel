import { useState } from "react";
import useShowToast from "./useShowToast";
import userAtom from '../atom/userAtom'
import { useRecoilValue, useSetRecoilState } from "recoil";

const useFollowUnfollow = (user) => {
	const currentUser = useRecoilValue(userAtom);
	const setCurrentUser = useSetRecoilState(userAtom);
	//const [following, setFollowing] = useState(user.contacts.includes(currentUser?._id));
	const [following, setFollowing] = useState(
		user.contacts ? user.contacts.includes(currentUser?._id) : false
	  );
	//const [pendingReq, setPendingReq] = useState(currentUser.pendingRequests.includes(user._id));
	const [pendingReq, setPendingReq] = useState(
		   currentUser.pendingRequests ? currentUser.pendingRequests.includes(user._id) : false
		);
	const [updating, setUpdating] = useState(false);
	const showToast = useShowToast();
    
	const handleFollowUnfollow = async () => {
		if (!currentUser) {
			showToast("Error", "Please login to follow", "error");
			return;
		}
		if (updating) return;

		setUpdating(true);
		try {
			const res = await fetch(`${window.location.origin}/api/users/follow/${user._id}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});
			const data = await res.json();
			if (data.error) {
				showToast("Error", data.error, "error");
				return;
			}

			if (following) {
				showToast("Success", `Unfollowed ${user.name}`, "success");
				setFollowing(false);
				setCurrentUser((prevUser) => ({
					...prevUser,
					contacts: prevUser.contacts.filter(contactId => contactId !== user._id)
				}));
			} else {
				showToast("Success", data.message, "success");
				if (data.message == 'Rejected connection request') {
					setCurrentUser((prevUser) => ({
						...prevUser,
						pendingRequests: prevUser.pendingRequests.filter(pendingReq => pendingReq !== user._id)
					}));
					setPendingReq(!pendingReq);
				}
				else {
					setPendingReq(!pendingReq);
					setCurrentUser((prevUser) => ({
						...prevUser,
						pendingRequests: [...prevUser.pendingRequests, user._id]
					}));
				}
			}
		} catch (error) {
			showToast("Error", error.message || "An error occurred", "error");
		} finally {
			setUpdating(false);
		}
	};

	return { handleFollowUnfollow, updating, following, pendingReq };
};

export default useFollowUnfollow;
