import React from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import style from "./PostAdoption.module.css";
import TextField from "@mui/material/TextField";
import Fab from "@mui/material/Fab";
import AddAPhotoTwoToneIcon from "@mui/icons-material/AddAPhotoTwoTone";
import MenuItem from "@mui/material/MenuItem";
import * as yup from "yup";
import ImagePostAdoption from "../../assets/image/fondoPostAdoption.png";
import IconButton from "@mui/material/IconButton";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useFormik } from "formik";
import { postPet } from "../../redux/slices/petsSlice";
import { useNavigate } from "react-router-dom";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Modal,
  Paper,
} from "@mui/material";
import { setError } from "../../redux/slices/errorsSlice";
import ErrorManager from "../../resources/ErrorManager";
import { setToGoAfterLogin } from "../../redux/slices/navigationSlice";
import { useEffect } from "react";
import { setAdoptionsBusyMode } from "../../redux/slices/adoptionSlice";
import { setMessage } from "../../redux/slices/messageInfoSlice";

const validationSchema = yup.object({
  name: yup.string("Enter Dogs name").required("El nombre es obligatorio"),
  // date: yup.string("Publication Date").required("fecha es obligatoria"),
  species: yup.string("pet Species").required("Especie es obligatoria"),
  age: yup.string("Enter pet age").required("edad es obligatoria").default(""),
  weight: yup
    .string("Enter pet weight")
    .required("Peso es obligatorio")
    .default(""),
  size: yup.string("Enter pet size").required("tamaño es obligatorio"),
  gender: yup.string("Enter pet gender").required("Genero es obligatorio"),
  breed: yup.string("Enter pet breed").required("raza es obligatorio"),
  description: yup
    .string("Describe your pet")
    .default("Descripcion de mascota"),
  ageTime: yup
    .string("Enter ageTime")
    .required("La edad en tiempo es requirida"),
});

const speciesArray = [
  {
    label: "",
  },
  {
    value: "feline",
    label: "Feline",
  },
  {
    value: "canine",
    label: "Canine",
  },
  {
    value: "fish",
    label: "Fish",
  },
  {
    value: "rodent",
    label: "Rodent",
  },
  {
    value: "equine",
    label: "Equine",
  },
  {
    value: "bovine",
    label: "Bovine",
  },
  {
    value: "ovine",
    label: "Ovine",
  },
  {
    value: "goat",
    label: "Goat",
  },
  {
    value: "other",
    label: "Other",
  },
];

const sizesArray = [
  {
    label: "",
  },
  {
    value: "small",
    label: "Small",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "big",
    label: "Big",
  },
];
const genderArray = [
  {
    label: "",
  },
  {
    value: "female",
    label: "Hembra",
  },
  {
    value: "male",
    label: "Macho",
  },
];

const ageTimeArray = [
  {
    label: "",
  },
  {
    value: "months",
    label: "Meses",
  },
  {
    value: "years",
    label: "Años",
  },
];

const PostAdoption = (props) => {
  const currentUser = useSelector((state) => state.users.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lang = useSelector((state) => state.lang.currentLangData);
  useEffect(() => {
    if (!currentUser) {
      dispatch(setToGoAfterLogin("/dar-en-adopcion"));
      navigate("/iniciar-sesion");
    }
  }, [currentUser]);
  const initialValues = {
    name: "",
    // date: "",
    email: currentUser ? currentUser["email"] : "",
    species: "",
    age: "",
    ageTime: "",
    weight: "",
    size: "",
    gender: "",
    breed: "",
    description: "",
  };

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchema,
    onSubmit: (values, { resetForm }) => {
      uploadData(values, resetForm);
    },
  });
  /**********************************************************/
  /*Todas estas lineas se agregaron para que funcione la subida de imagenes
a cloudinary, esto se tiene que modificar ya que cloud_name y preset deben estar
en un archivo .env, momentaneamente lo dejo asi para que puedan probar si gustan.

Al momento de pasar a producción hay que eliminar los console.log

También se modificaria cuando se añadan las actions y el reducer, ya que es ahi
en donde debe hacerse para enviar el post a /animals */
  const [file, setFile] = useState(null);

  const cloud_name = "dydncradb";
  const preset = "qeohapyd";

  const uploadData = async (values, resetForm) => {
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;

    const formData = new FormData();
    formData.append("upload_preset", `${preset}`);
    formData.append("file", file);

    try {
      dispatch(setAdoptionsBusyMode(true));
      const res = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        dispatch(setAdoptionsBusyMode(true));
        dispatch(
          setError(
            ErrorManager.CreateErrorInfoObject(
              {
                name: "CloudinaryUploadImageError",
                code: "Unknown",
              },
              []
            )
          )
        );
        return null;
      }

      const data = await res.json();
      dispatch(
        postPet({
          ...values,
          image: data.secure_url,
        })
      );
      dispatch(setAdoptionsBusyMode(false));
      dispatch(
        setMessage({
          title: "Completado",
          message: "Se han cargado tus datos correctamente",
          details: [],
        })
      );
      setFile(null);
      resetForm();
      setTimeout(() => {
        navigate("/adopciones");
      }, 1000);
    } catch (error) {
      console.log({ error });
    }
  };
  /**********************************************************/

  return (
    <>
      <Box
        className={style.gridPostAdoption}
        sx={{ marginBottom: "100px", marginTop: "150px", paddingBottom: "200px" }}
      >
        <Container className={style.containerPostAdoption} >
          <form onSubmit={formik.handleSubmit}>
            <Grid
              container
              spacing={5}
              justifyContent="center"
              alignItems="center"
              sx={{ height: "100%" }}
            >
              <Box className={style.gridContactImage}>
                {/* <img src={ImagePostAdoption} alt="" /> */}
              </Box>
              <Grid item xs={12}>
                <Typography
                  component="h1"
                  variant="h3"
                  align="center"
                  sx={{
                    color: "#FF3041",
                    textTransform: "uppercase",
                    fontWeight: "700",
                    marginTop: "50px"
                  }}
                >
                  {lang.darEnAdopcion.titles.darEnAdopcion}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                    justifyContent: "center",
                    height: "100%",
                    marginRight: "60px",
                    marginLeft: "60px"
                  }}
                >
                  <TextField
                    id="name"
                    label={lang.darEnAdopcion.inputs.nombre + ":"}
                    variant="standard"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                  />
                  <TextField
                    id="species"
                    select
                    label={lang.darEnAdopcion.inputs.especie + ":"}
                    value={formik.values.species}
                    SelectProps={{
                      native: true,
                    }}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.species && Boolean(formik.errors.species)
                    }
                    helperText={formik.touched.species && formik.errors.species}
                    variant="standard"
                  >
                    {speciesArray.map((option) => (
                      <option key={option.value} value={option.value}>
                        {
                          lang.darEnAdopcion.values.especies[
                          option.label.toLowerCase()
                          ]
                        }
                      </option>
                    ))}
                  </TextField>

                  <TextField
                    type="number"
                    inputProps={{ min: 0 }}
                    label={lang.darEnAdopcion.inputs.edad + ":"}
                    variant="standard"
                    id="age"
                    name="age"
                    value={formik.values.age}
                    onChange={formik.handleChange}
                    error={formik.touched.age && Boolean(formik.errors.age)}
                    helperText={formik.touched.age && formik.errors.age}
                  />
                  <TextField
                    type="number"
                    select
                    label={lang.darEnAdopcion.inputs.rango + ":"}
                    variant="standard"
                    id="ageTime"
                    name="ageTime"
                    value={formik.values.ageTime}
                    SelectProps={{
                      native: true,
                    }}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.ageTime && Boolean(formik.errors.ageTime)
                    }
                    helperText={formik.touched.ageTime && formik.errors.ageTime}
                  >
                    {ageTimeArray.map((option) => (
                      <option key={option.value} value={option.value}>
                        {
                          lang.darEnAdopcion.values.rangoTiempo[
                          option.label.toLowerCase()
                          ]
                        }
                      </option>
                    ))}
                  </TextField>

                  <TextField
                    type="number"
                    label={lang.darEnAdopcion.inputs.peso + ":"}
                    variant="standard"
                    inputProps={{ min: 0 }}
                    id="weight"
                    name="weight"
                    value={formik.values.weight}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.weight && Boolean(formik.errors.weight)
                    }
                    helperText={formik.touched.weight && formik.errors.weight}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                {/* La linea de abajo genera una preview de la imagen que se eligió para subir,
                     si quieren implementarlo quedaria bastante bien, yo no lo hago porque me da miedo el mui jajajaj*/}
                {/* { file ? <img alt="Preview" height="60" src={URL.createObjectURL(file)} /> : null } */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                    justifyContent: "center",
                    height: "100%",
                    marginRight: "60px",
                    // marginLeft:"60px"
                  }}
                >
                  <IconButton
                    aria-label="upload picture"
                    color='yellowButton' 
                    size="large" 
                    sx={{ borderRadius: '20px' }}
                    component="label"
                  >
                    <input
                      accept="image/*"
                      type="file"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
//                     <PhotoCamera />
                  </IconButton>
                  <TextField
                    id="size"
                    select
                    label={lang.darEnAdopcion.inputs.tamaño + ":"}
                    value={formik.values.size}
                    SelectProps={{
                      native: true,
                    }}
                    onChange={formik.handleChange}
                    error={formik.touched.size && Boolean(formik.errors.size)}
                    helperText={formik.touched.size && formik.errors.size}
                    variant="standard"
                  >
                    {sizesArray.map((option) => (
                      <option key={option.value} value={option.value}>
                        {
                          lang.darEnAdopcion.values.tamaños[
                          option.label.toLowerCase()
                          ]
                        }
                      </option>
                    ))}
                  </TextField>
                  <TextField
                    id="gender"
                    name="gender"
                    select
                    label={lang.darEnAdopcion.inputs.genero + ":"}
                    value={formik.values.gender}
                    SelectProps={{
                      native: true,
                    }}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.gender && Boolean(formik.errors.gender)
                    }
                    helperText={formik.touched.gender && formik.errors.gender}
                    variant="standard"
                  >
                    {genderArray.map((option) => (
                      <option key={option.value} value={option.value}>
                        {
                          lang.darEnAdopcion.values.generos[
                          option.label.toLowerCase()
                          ]
                        }
                      </option>
                    ))}
                  </TextField>
                  <TextField
                    label={lang.darEnAdopcion.inputs.raza + ":"}
                    variant="standard"
                    id="breed"
                    name="breed"
                    value={formik.values.breed}
                    onChange={formik.handleChange}
                    error={formik.touched.breed && Boolean(formik.errors.breed)}
                    helperText={formik.touched.breed && formik.errors.breed}
                  />
                  <TextField
                    label={lang.darEnAdopcion.inputs.descripcion + ":"}
                    variant="standard"
                    id="description"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.description &&
                      Boolean(formik.errors.description)
                    }
                    helperText={
                      formik.touched.description && formik.errors.description
                    }
                  />
                </Box>
              </Grid>
              <Button
                type="submit"
                variant="contained"
                color="yellowButton"
                size="large"
                sx={{
                  borderRadius: "20px",
                  padding: "10px 60px",
                  marginTop: "50px",
                }}
              >
                {lang.darEnAdopcion.buttons.publicar}
              </Button>
            </Grid>
          </form>
        </Container>
      </Box>
    </>
  );
};

export default PostAdoption;
