import React,{ useEffect, useState } from "react";
import { editManageRoles, getManageRolesDetails } from "../apis";
import { useToast } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { FormikTextInput } from "@/MuLearnComponents/FormikComponents/FormikComponents";
import { MuButton } from "@/MuLearnComponents/MuButtons/MuButton";
import styles from "./Modal.module.css"
import mustyles from "@/MuLearnComponents/MuButtons/MuButtons.module.css"

type Props = {
    id:string
    onClose:any
};

const ManageRolesEditModal = (props: Props) => {
    interface IData {
        title: string;
        description: string;
    }

    const [data, setData] = useState<IData>({
        title: "",
        description: ""
    });
    const id = props.id
    const toast = useToast();
    useEffect(() => {
        getManageRolesDetails(id, setData);
    }, []);

    return (
        <Formik 
            enableReinitialize={true}
            initialValues={{
                // igName: name
                title: data.title,
                description: data.description
            }}
            validationSchema={Yup.object({
                // igName: Yup.string()
                //     .max(30, "Must be 30 characters or less")
                //     .required("Required"),
                title: Yup.string()
                    .max(30, "Must be 30 characters or less")
                    .required("Required"),
                description: Yup.string()
                    .max(30, "Must be 30 characters or less")
                    .required("Required")
            })}
            onSubmit={values => {
                (async()=>{
                    await editManageRoles(
                        id,
                        values.title,
                        values.description,
                        toast
                    );
                    props.onClose(null)
                })()
                
            }}
        >
            <Form className={styles.Form}>
                <FormikTextInput
                    label=""
                    name="title"
                    type="text"
                    placeholder="Role title"
                />
                <FormikTextInput
                    label=""
                    name="description"
                    type="text"
                    placeholder="Role description"
                />

                <div className={styles.ButtonContainer}>
                    <MuButton
                        className={`${mustyles.btn} ${styles.Decline}`}
                        text={"Decline"}
                        onClick={() => {
                            props.onClose(null)
                        }}
                    />
                    <MuButton
                        className={`${mustyles.btn} ${styles.Confirm}`}
                        text={"Confirm"}
                        submit={true}
                    />
                </div>
            </Form>
        </Formik>
    );
};

export default ManageRolesEditModal;
