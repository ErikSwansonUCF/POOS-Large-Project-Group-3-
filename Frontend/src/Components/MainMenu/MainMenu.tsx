import { useState, useEffect } from 'react'
import './MainMenu.css'
import x_icon from '../Assets/x.png'
import pen_icon from '../Assets/edit.png'

function MainMenu()
{
    let userJSON = localStorage.getItem('user_data')
    let userObj = JSON.parse(userJSON!);
    const [state, setState] = useState('normal');
    const [newName, setNewName] = useState('');
    const [newTopic, setNewTopic] = useState('');
    // const [editState, setEditState] = useState(false);
    // const [editName, setEditName] = useState('');
    // const [editTopic, setEditTopic] = useState('');
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [userSets, setUserSets] = useState<any[]>([]);  // New state to store user sets

    const app_name = 'cop4331-project.online'
    function buildPath(route:string) : string
    {
        if (process.env.NODE_ENV != 'development') 
        {
            return 'http://' + app_name +  ':5000/' + route;
        }
        else
        {        
            return 'http://localhost:5000/' + route;
        }
    }
    async function showSets(): Promise<void> {
        // Check if userObj is valid
        if (!userObj || !userObj.id) {
          console.error("User object or user ID is missing");
          return;
        }
      
        // console.log("This is UserID: ", userObj.id);
        let obj = { userId: userObj.id };
        let js = JSON.stringify(obj);
      
        try {
          const response = await fetch(buildPath('api/getUserSets'), {
            method: 'POST',
            body: js,
            headers: { 'Content-Type': 'application/json' },
          });
      
          // Parse the response safely
          const resText = await response.text();
          if (!resText) {
            console.error("Empty response received from the server");
            return;
          }
      
          let res = JSON.parse(resText);
   
      
          // Check if res.sets exists and is an array
          if (!res.sets || !Array.isArray(res.sets)) {
            console.error("Expected 'sets' array not found in response", res);
            return;
          }
      
          setUserSets(res.sets);
          console.log(userSets);

        } 
        catch (error: any) 
        {
          alert(error.toString());
        }
      }

    async function deleteCardSet(id: string) 
    {
      let obj = {id : id};
      let js = JSON.stringify(obj);
      try
        {
            const response = await fetch(buildPath('api/deleteCardSet'), {
              method: 'POST',
              body: js,
              headers: { 'Content-Type': 'application/json' },
            });

          const resText = await response.text();
          if (!resText) {
            console.error("Empty response received from the server");
            return;
          }
          console.log("Card ID:" + id + " deleted");
          showSets();
        }
        catch (error:any)
        {
          alert(error.toString());
        }
    };


    async function editCardSet(id:string, index:number)
    {
      console.log("Editing Card ID: " + id);
      console.log("Array ID: " + index)
      // console.log("New Name: " + editName);
      // console.log("New Topics: " + editTopic);
      // // setEditState(true);
      // let obj = {id : id, Name : editName, Topic : editTopic};
      // let js = JSON.stringify(obj);
    }

    async function openSet(id : string)
    {
      console.log("Opening Set: " + id);
      localStorage.setItem('card_id', id);
      window.location.href = '/card'
    }



    function doLogout(event:any) : void
    {
	    event.preventDefault();
		
      localStorage.removeItem("user_data")
      window.location.href = '/';
    }; 

    async function addCardSet(event:any) : Promise<void>
    {
        event.preventDefault();
        let obj = {Name:newName, Topic:newTopic, UserId: userObj.id, Published: "true"};
        let js = JSON.stringify(obj);
        try
        {
            const response = await fetch(buildPath('api/createCardSet'), {
                method: 'POST',
                body: js,
                headers: { 'Content-Type': 'application/json' },
              });

        // Parse the response safely
          const resText = await response.text();
          if (!resText) {
            console.error("Empty response received from the server");
            return;
          }
          

          console.log("Added")
          setState("normal");
          showSets();
        }
        catch
        {

        }
    }

    function addCardWrapper() : void
    {
      if (state === "adding") {
        setIsFadingOut(true); 
        setTimeout(() => {
            setState("normal"); 
            setIsFadingOut(false); 
        }, 150); 
    } else {
        setState("adding"); 
    }
  }

    function handleNewName(event:any) : void
    {
        setNewName(event.target.value);
    }

    function handleNewTopic(event:any) : void
    {
        setNewTopic(event.target.value);
    }



    useEffect(() => {
      // Call showSets once when the component mounts
      showSets();
    }, []);
    
  return (
    <div>
        <div className="blurredBackground"></div>
        <div className="addButton" onClick={addCardWrapper}>+</div>
        <div className="logoutButton" onClick={doLogout}>Log Out</div>
        <div><h1>Welcome {userObj.displayName}</h1></div>
        <div><h2>Here are your sets</h2></div>
        {state === "normal"?<div></div>:
        <div className={`cardSet ${isFadingOut ? "fadeOut" : ""}`} id="set0">
            <input type="text" id='setName' placeholder="Set Name"onChange={handleNewName}></input>
            <input type="text" id='setTopic' placeholder="Set Topic"onChange={handleNewTopic}></input>
            <div className='makeSet'onClick={addCardSet}>Add</div>
        </div>}
        <div className="listCardSets">
        {userSets.map((set, index) => (
          <div key={index} className="cardSet" onClick={() => openSet(set._id)} id={`set${index + 1}`}>
            <div className="nameTopic">
              {set.Name}
              <br />
              <span id="topic">{set.Topic}</span>
            </div>
            <div className="editDelete">
              <img
                src={pen_icon}
                onClick={(e) => { 
                  e.stopPropagation(); // Prevent the card set from being opened when clicking edit
                  editCardSet(set._id, index + 1);
                }}
                alt="Edit icon"
                id="editCardButton"
              />
              <img
                src={x_icon}
                onClick={(e) => { 
                  e.stopPropagation(); // Prevent the card set from being opened when clicking delete
                  deleteCardSet(set._id);
                }}
                alt="Delete icon"
                id="delCardButton"
              />
            </div>
          </div>
        ))}
        </div>
    </div>
  )
}

export default MainMenu
