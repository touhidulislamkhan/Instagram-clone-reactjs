import React, { useState } from 'react';
import './ImageUpload.css';
import { Button } from '@material-ui/core';
import firebase from 'firebase';
import { db, storage } from './firebase';

function ImageUpload({ username }) {

    const [caption, setCaption] = useState('');
    const [image, setImage] = useState(null);
    const [progress, setProgress] = useState(0);

    const handleChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        const uploadTask = storage.ref(`images/${image.name}`).put(image);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                //Progress function.....
                const progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
                );
                setProgress(progress);
            },
            (error) => {
                // Error function
                console.log(error);
                alert(error.message);
            },
            () => {
                //Complete function
                storage.ref("images")
                    .child(image.name)
                    .getDownloadURL()
                    .then(url => {
                        //post image inside db
                        db.collection("posts").add({
                            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                            caption: caption,
                            imageUrl: url,
                            username: username
                        });

                        setProgress(0);
                        setCaption("");
                        setImage(null);

                    })
            }
        )
    };



    return (
        <div className="imageupload">

            {/*  I want to have the following..... */}
            {/* Caption input */}

            <progress className="imageupload__progress" value={progress} max="100" />

            <input type="text"
                placeholder="Enter a caption..."
                onChange={event => setCaption(event.target.value)}
                value={caption}
            />

            {/* File picker */}

            <input type="file" onChange={handleChange} />

            {/* Post button */}

            <Button onClick={handleUpload}>Upload</Button>

        </div>
    )
}

export default ImageUpload;
