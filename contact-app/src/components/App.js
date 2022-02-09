import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import uuidv4, { uuid } from "uuidv4";
import "./App.css";
import Header from "./Header";
import AddContact from "./AddContact";
import ContactList from "./ContactList";
import ContactDetail from "./ContactDetail";
import api from "../api/contacts";
import EditContact from "./EditContact";
// import contactList from "./ContactList";
function App() {
	const LOCAL_STORAGE_KEY = "contacts";
	const [contacts, setContacts] = useState([]);

	const [searchTerm, setSearchTerm] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	//retrive contacts
	const retriveContacts = async () => {
		const response = await api.get("/contacts");
		console.log(response.data);
		return response.data;
	};

	const addContactHandler = async (contact) => {
		const request = {
			id: uuidv4(),
			...contact,
		};

		const response = await api.post("/contacts", request);
		setContacts([...contacts, response.data]);
	};

	const updateContactHandler = async (contact) => {
		const response = await api.put(`/contacts/${contact.id}`, contact);
		const { id, name, email } = response.data;
		setContacts(
			contacts.map((contact) => {
				return contact.id === id ? { ...response.data } : contact;
			})
		);
	};

	const removeContactHandler = async (id) => {
		await api.delete(`/contacts/${id}`);
		const newContactList = contacts.filter((contact) => {
			return contact.id !== id;
		});

		setContacts(newContactList);
	};

	const searchHandler = (searchTerm) => {
		setSearchTerm(searchTerm);
		if (searchTerm !== "") {
			const newContactList = contacts.filter((contact) => {
				return Object.values(contact)
					.join(" ")
					.toLowerCase()
					.includes(searchTerm.toLowerCase());
			});
			setSearchResults(newContactList);
		} else {
			setSearchResults(contacts);
		}
	};

	useEffect(() => {
		// const retriveContacts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
		// if (retriveContacts) setContacts(retriveContacts);

		const getAllContacts = async () => {
			const allContacts = await retriveContacts();
			if (allContacts) setContacts(allContacts);
		};
		getAllContacts();
	}, []);

	useEffect(() => {
		// localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contacts));
	}, [contacts]);
	return (
		<div className="ui container">
			<Header />
			<Router>
				<Switch>
					<Route
						exact
						path="/"
						render={(props) => (
							<ContactList
								{...props}
								contacts={searchTerm.length < 1 ? contacts : searchResults}
								getContactId={removeContactHandler}
								term={searchTerm}
								searchKeyword={searchHandler}
							/>
						)}
					/>
					<Route
						exact
						path="/add"
						render={(props) => (
							<AddContact {...props} addContactHandler={addContactHandler} />
						)}
					/>

					<Route
						exact
						path="/edit"
						render={(props) => (
							<EditContact
								{...props}
								updateContactHandler={updateContactHandler}
							/>
						)}
					/>
					<Route exact path="/contact/:id" component={ContactDetail} />
				</Switch>
			</Router>
		</div>
	);
}

export default App;
