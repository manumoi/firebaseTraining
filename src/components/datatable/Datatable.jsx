import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { userColumns } from "../../datatablesource";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from '../../firebase'

const Datatable = () => {
  const [data, setData] = useState([]);

  useEffect(
    () => {
      // EBL WARNING: because the focus is [], this useEffect will be fired each time the datatable is rendered. 
      // Not optimal to fetch data this way if data request and data itself haven't changed.
      const fetchData = async () => {
        let list = []
        try {
          const querySnapshot = await getDocs(collection(db, "users"));
          querySnapshot.forEach((doc) => {
            list.push({id:doc.id, ...doc.data()})
          });
          setData(list)
        }
        catch (err) {
          console.log(err);
        }
      }
      fetchData()
    },
    [])


  console.log(data)

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "cities", "DC"));
    setData(data.filter((item) => item.id !== id));
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
