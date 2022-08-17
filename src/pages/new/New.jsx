import "./new.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState, useEffect } from "react";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { storage, auth, db } from "../../firebase"
import { useNavigate } from "react-router-dom";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const New = ({ inputs, title }) => {
  const [file, setFile] = useState("");
  const [data, setData] = useState({});
  const [pwd, setPwd] = useState("");
  const [percentage, setPercentage] = useState(null);
  const navigate = useNavigate();

  // FYI inadequate moment for image upload. it should happen when submitting the form
  // upload image, then create/upload user data with image url and if error, delete db version of the image
  useEffect(() => {
    const uploadImage = () => {
      const metadata = {
        contentType: `image/jpeg`
      };
      const uniqueName = `${new Date().getTime()}_${file.name}`
      const storageRef = ref(storage, 'images/' + uniqueName);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setPercentage(progress);
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
            default:
              break;
          }
        },
        (error) => {
          switch (error.code) {
            case 'storage/unauthorized':
              console.log(`Unauthorized: ${error.message}`)
              // User doesn't have permission to access the object
              break;
            case 'storage/canceled':
              console.log(`Cancelled: ${error.message}`)
              // User canceled the upload
              break;
            case 'storage/unknown':
              // Unknown error occurred, inspect error.serverResponse
              break;
            default:
              break;
          }
        },
        () => {
          console.log("Upload is over - success")
          // Upload completed successfully, now we can get the download URL
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setData((prev) => ({ ...prev, img: downloadURL })) // prev is actually data, but since data is a dependency, we use another memory space by referring to the function
          })
        }
      );
    }
    file && uploadImage(); // if there s a file, then upload it to firebase
  }, [file])

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(auth, data.email, pwd)
      await setDoc(doc(db, "users", res.user.uid), {
        ...data,
        timeStamp: serverTimestamp()
      })
      // success, let s get rid of form data
      setData({}) 
      setPwd("")
      // and navigate back to the proper page 
      // TODO make it dynamic, according to users or products
      navigate(-1);
    }
    catch (err) {
      console.log(err);
    }
  }

  const handleInputChange = (e) => {
    const id = e.target.id;
    const value = e.target.value;
    if (id === "password") // we dont want to have an unprotected db storage of user passwords. so password must not be in data we ll send
      setPwd(value);
    else
      setData({ ...data, [id]: value })
  }

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>{title}</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt=""
            />
          </div>
          <div className="right">
            <form onSubmit={handleAdd}>
              <div className="formInput">
                <label htmlFor="file">
                  Image: <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </div>

              {inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input
                    id={input.id}
                    type={input.type}
                    placeholder={input.placeholder}
                    onChange={handleInputChange}
                  />
                </div>
              ))
              }
              <br/>
              <button disabled={percentage!==null && percentage<100} type="submit">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default New;
