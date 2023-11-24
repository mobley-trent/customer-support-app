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