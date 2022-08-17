import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { userColumns } from "../../datatablesource";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, onSnapshot } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { db, auth } from '../../firebase';

const Datatable = () => {
  const [data, setData] = useState([]);

  useEffect(
    () => {
      // EBL WARNING: because the focus is [], this useEffect will be fired each time the datatable is rendered. 
      // Not optimal to fetch data this way if data request and data itself haven't changed.
      /*const fetchData = async () => {
        let list = []
        try {
          const querySnapshot = await getDocs(collection(db, "users"));
          querySnapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() })
          });
          setData(list)
        }
        catch (err) {
          console.log(err);
        }
      }
      fetchData()*/
      const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
        let list = [];
        snapshot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        })
        setData(list)
      }, 
      (error) => {
        console.log(error);
      });

      // cleanup function to avoid creating a memory leak by calling it every time the component is mounted
      return ()=>{
        unsub();
      }
    }, [])


  console.log(data)

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", id));
      setData(data.filter((item) => item.id !== id));
    }
    catch (err2) {
      console.log(err2);
    }
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link to="/users/test" style={{ textDecoration: "none" }}>
              <div className="viewButton">View</div>
            </Link>
            <div
              className="deleteButton"
              onClick={() => handleDelete(params.row.id)}
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];
  return (
    <div className="datatable">
      <div className="datatableTitle">
        Add New User
        <Link to="/users/new" className="link">
          Add New
        </Link>
      </div>
      <DataGrid
        className="datagrid"
        rows={data}
        columns={userColumns.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
      />
    </div>
  );
};

export default Datatable;
