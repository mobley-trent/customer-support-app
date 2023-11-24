import { account, db, storage } from "./appwrite";
import { ID } from "appwrite";

const generateID = () => Math.random().toString(36).substring(2, 24);

//👇🏻 filters the users' list
const checkUserFromList = async (email, router) => {
    try {
        const response = await db.listDocuments(
            process.env.NEXT_PUBLIC_DB_ID,
            process.env.NEXT_PUBLIC_USERS_COLLECTION_ID
        );
        const users = response.documents;
        const result = users.filter((user) => user.email === email);

        //👉🏻 USER OBJECT ==> console.log(result[0])

        if (result.length > 0) {
            successMessage("Welcome back 🎉");
            router.push("/staff/dashboard");
        } else {
            errorMessage("Unauthorized...Contact Management.");
        }
    } catch (error) {
        errorMessage("An error occurred 😪");
        console.error(error);
    }
};

//👇🏻 authenticates the user
export const logIn = async (email, password, router) => {
    try {
        //👇🏻 Appwrite login method
        await account.createEmailSession(email, password);
        //👇🏻 calls the filter function
        await checkUserFromList(email, router);
    } catch (error) {
        console.log(error);
        errorMessage("Invalid credentials ❌");
    }
};

export const logOut = async (router) => {
    try {
        await account.deleteSession("current");
        router.push("/");
        successMessage("Logging out...");
    } catch (error) {
        console.log(error);
        errorMessage("Encountered an error 😪");
    }
};

export const checkAuthStatus = async (setUser, setLoading, router) => {
	try {
		const response = await account.get();
		setUser(response);
		setLoading(false);
	} catch (err) {
		router.push("/");
		console.error(err);
	}
};

export const addUser = async (name, email, password) => {
	try {
		//👇🏻 create a new acct on Appwrite Auth
		await account.create(generateID(), email, password, name);
		//👇🏻 adds the user's details to the users database
		await db.createDocument(
			process.env.NEXT_PUBLIC_DB_ID,
			process.env.NEXT_PUBLIC_USERS_COLLECTION_ID,
			ID.unique(),
			{ user_id: generateID(), name, email }
		);
		successMessage("User added successfully 🎉");
	} catch (error) {
		console.log(error);
	}
};

export const getUsers = async (setUsers) => {
    try {
        const response = await db.listDocuments(
            process.env.NEXT_PUBLIC_DB_ID,
            process.env.NEXT_PUBLIC_USERS_COLLECTION_ID
        );
        setUsers(response.documents);
    } catch (error) {
        console.log(error);
    }
};

export const deleteUser = async (id) => {
    try {
        await db.deleteDocument(
            process.env.NEXT_PUBLIC_DB_ID,
            process.env.NEXT_PUBLIC_USERS_COLLECTION_ID,
            id
        );
        successMessage("User removed 🎉"); // Success
    } catch (error) {
        console.log(error); // Failure
        errorMessage("Encountered an error 😪");
    }
};

export const startMessage = async (
	name,
	email,
	subject,
	message,
	attachment,
	setLoading
) => {
	const createTicket = async (file_url = "https://google.com") => {
		try {
			const response = await db.createDocument(
				process.env.NEXT_PUBLIC_DB_ID,
				process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID,
				ID.unique(),
				{
					name,
					email,
					subject,
					content: message,
					status: "open",
					messages: [
						JSON.stringify({
							id: generateID(),
							content: message,
							admin: false,
							name: "Customer",
						}),
					],
					attachment_url: file_url,
					access_code: generateID(),
				}
			);
			//👇🏻 email user who created the ticket
			emailTicketCreation(
				name,
				response.$id,
				email,
				convertDateTime(response.$createdAt),
				subject
			);
			newTicketStaff(name);
			setLoading(false);
			successMessage("Ticket created 🎉");
		} catch (error) {
			errorMessage("Encountered saving ticket ❌");
		}
	};

	if (attachment !== null) {
		try {
			const response = await storage.createFile(
				process.env.NEXT_PUBLIC_BUCKET_ID,
				ID.unique(),
				attachment
			);
			const file_url = `https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_BUCKET_ID}/files/${response.$id}/view?project=${process.env.NEXT_PUBLIC_PROJECT_ID}&mode=admin`;
			createTicket(file_url);
		} catch (error) {
			errorMessage("Error uploading the image ❌");
		}
	} else {
		await createTicket();
	}
};

export const getTickets = async (
	setOpenTickets,
	setInProgressTickets,
	setCompletedTickets
) => {
	try {
		const response = await db.listDocuments(
			process.env.NEXT_PUBLIC_DB_ID,
			process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID
		);
		const tickets = response.documents;
		const openTickets = tickets.filter((ticket) => ticket.status === "open");
		const inProgressTickets = tickets.filter(
			(ticket) => ticket.status === "in-progress"
		);
		const completedTickets = tickets.filter(
			(ticket) => ticket.status === "completed"
		);
		setCompletedTickets(completedTickets);
		setOpenTickets(openTickets);
		setInProgressTickets(inProgressTickets);
	} catch (error) {
		console.log(error); // Failure
	}
};

export const updateTicketStatus = async (id, status) => {
    try {
        await db.updateDocument(
            process.env.NEXT_PUBLIC_DB_ID,
            process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID,
            id,
            { status }
        );
        successMessage("Status updated, refresh page 🎉");
    } catch (error) {
        console.log(error); // Failure
        errorMessage("Encountered an error ❌");
    }
};

export const sendMessage = async (text, docId) => {
	const doc = await db.getDocument(
		process.env.NEXT_PUBLIC_DB_ID,
		process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID,
		docId
	);

	try {
		const user = await account.get();
		const result = await db.updateDocument(
			process.env.NEXT_PUBLIC_DB_ID,
			process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID,
			docId,
			{
				messages: [
					...doc.messages,
					JSON.stringify({
						id: generateID(),
						content: text,
						admin: true,
						name: user.name,
					}),
				],
			}
		);
		if (result.$id) {
			successMessage("Message Sent! ✅");
			emailStaffMessage(
				doc.name,
				`https://customer-support.vercel.app/chat/${doc.$id}`,
				doc.email,
				doc.access_code
			);
		} else {
			errorMessage("Error! Try resending your message❌");
		}
	} catch (error) {
		const result = await db.updateDocument(
			process.env.NEXT_PUBLIC_DB_ID,
			process.env.NEXT_PUBLIC_TICKETS_COLLECTION_ID,
			docId,
			{
				messages: [
					...doc.messages,
					JSON.stringify({
						id: generateID(),
						content: text,
						admin: false,
						name: "Customer",
					}),
				],
			}
		);
		if (result.$id) {
			successMessage("Message Sent! ✅");
			notifyStaff(result.name, result.status, result.subject);
		} else {
			errorMessage("Error! Try resending your message❌");
		}
	}
};