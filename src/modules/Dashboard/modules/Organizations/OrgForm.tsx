import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import styles from "../../utils/modalForm.module.css";
import useLocationData from "@/MuLearnComponents/CascadingSelects/useLocationData";
import CountryStateDistrict from "@/MuLearnComponents/CascadingSelects/CountryStateDistrict";
import toast from "react-hot-toast";
import { addNewOrganization, getAffiliation } from "./apis";
import Select from "react-select";
import { customReactSelectStyles } from "../../utils/common";
import { useNavigate } from "react-router-dom";

type Props = { type: string; isEditMode: boolean; itemId: string };

interface OrgFormData {
    affiliation: string;
    code: string;
    country: string;
    district: string;
    org_type: string;
    state: string;
    title: string;
}

interface OrgFormErrors {
    [key: string]: string | undefined;
}

type InitialLocationData = {
    country: { label: string; value: string };
    state: { label: string; value: string };
    district: { label: string; value: string };
} | null;

interface AffiliationOption {
    label: string;
    value: string;
}

const OrgForm = forwardRef(
    (props: Props & { closeModal: () => void }, ref: any) => {
        const [initialData, setInitialData] =
            useState<InitialLocationData>(null);
        const navigate = useNavigate();

        // Fetch the initial data if in edit mode
        // useEffect(() => {
        //     if (props.isEditMode) {
        //         // Replace this with your actual API call
        //         fetchYourDataAPI(itemId).then(data => {
        //             setInitialData({
        //                 country: {
        //                     label: data.countryName,
        //                     value: data.countryValue
        //                 },
        //                 state: { label: data.stateName, value: data.stateValue },
        //                 district: {
        //                     label: data.districtName,
        //                     value: data.districtValue
        //                 }
        //             });
        //         });
        //     }
        // }, [props.isEditMode, props.itemId]);

        // If initialData is null (not fetched yet), we can show a loading state
        if (props.isEditMode && !initialData) {
            return <p>Loading...</p>;
        }

        const {
            locationData,
            loadingCountries,
            loadingStates,
            loadingDistricts,
            handleCountryChange,
            handleStateChange,
            handleDistrictChange
        } = useLocationData(initialData);

        const [data, setData] = useState<OrgFormData>({
            affiliation: "",
            code: "",
            country: initialData?.country.value || "",
            district: initialData?.district.value || "",
            org_type: props.type,
            state: initialData?.state.value || "",
            title: ""
        });

        const [errors, setErrors] = useState<OrgFormErrors>({});

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            setData(prevData => ({ ...prevData, [name]: value }));
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            if (!value.trim()) {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    [name]: `${
                        name.charAt(0).toUpperCase() + name.slice(1)
                    } is required`
                }));
            } else {
                setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
            }
        };

        const [affiliations, setAffiliations] = useState<any[]>([]); // Add this state for fetched affiliations
        const [selectedAffiliation, setSelectedAffiliation] =
            useState<AffiliationOption | null>(null);
        const [blurStatus, setBlurStatus] = useState({ affiliation: false }); // Add this state for blur status

        useEffect(() => {
            getAffiliation(setAffiliations);
        }, []);

        //! useImperativeHandle for triggering submit from MuModal button
        useImperativeHandle(ref, () => ({
            handleSubmitExternally: handleSubmit
        }));

        const handleSubmit = (e?: React.FormEvent) => {
            e?.preventDefault();

            const updatedData = {
                ...data,
                affiliation: String(selectedAffiliation?.value),
                country: String(locationData.selectedCountry?.value),
                state: String(locationData.selectedState?.value),
                district: String(locationData.selectedDistrict?.value)
            };

            console.log(updatedData);

            // Validate form data
            let isValid = true;
            for (const key in updatedData) {
                if (
                    updatedData[key as keyof OrgFormData] === "" ||
                    updatedData[key as keyof OrgFormData] === "undefined"
                ) {
                    isValid = false;
                    setErrors(prevErrors => ({
                        ...prevErrors,
                        [key]: `${
                            key.charAt(0).toUpperCase() + key.slice(1)
                        } is required`
                    }));
                    toast.error(`Error: ${key} is required`);
                }
            }

            if (isValid) {
                console.log(updatedData);
                if (props.isEditMode) {
                    // Update existing data with updatedData
                } else {
                    toast.promise(addNewOrganization(updatedData), {
                        loading: "Saving...",
                        success: () => {
                            props.closeModal();
                            return <b>Organization added</b>;
                        },
                        error: <b>Failed add new organization</b>
                    });
                }
            }
        };

        return (
            <div className={styles.container}>
                <form className={styles.formContainer} onSubmit={handleSubmit}>
                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            name="title"
                            placeholder="Title"
                            value={data.title}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                        {errors.title && (
                            <div style={{ color: "red" }}>{errors.title}</div>
                        )}
                    </div>

                    <div className={styles.inputContainer}>
                        <Select
                            styles={customReactSelectStyles}
                            options={affiliations}
                            isClearable
                            placeholder="Affiliation"
                            isLoading={!affiliations.length}
                            value={selectedAffiliation}
                            onChange={value => setSelectedAffiliation(value)}
                            onBlur={() => {
                                setBlurStatus(prev => ({
                                    ...prev,
                                    affiliation: true
                                }));
                            }}
                        />
                        {blurStatus.affiliation && !selectedAffiliation && (
                            <div style={{ color: "red" }}>
                                Affiliation is Required
                            </div>
                        )}
                    </div>

                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            name="code"
                            placeholder="Code"
                            value={data.code}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                        {errors.code && (
                            <div style={{ color: "red" }}>{errors.code}</div>
                        )}
                    </div>

                    <CountryStateDistrict
                        countries={locationData.countries}
                        states={locationData.states}
                        districts={locationData.districts}
                        selectedCountry={locationData.selectedCountry}
                        selectedState={locationData.selectedState}
                        selectedDistrict={locationData.selectedDistrict}
                        loadingCountries={loadingCountries}
                        loadingStates={loadingStates}
                        loadingDistricts={loadingDistricts}
                        onCountryChange={handleCountryChange}
                        onStateChange={handleStateChange}
                        onDistrictChange={handleDistrictChange}
                    />
                </form>
            </div>
        );
    }
);

export default OrgForm;